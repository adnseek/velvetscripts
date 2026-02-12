import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateImage, buildImagePrompt, extractStorySections, summarizeForImagePrompt } from "@/lib/venice";
import { mkdir, rm } from "fs/promises";
import path from "path";
import sharp from "sharp";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const { storyId, mode = "all" } = await request.json(); // mode: "all" | "hero" | "sections"
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        if (!storyId) { send("error", { message: "storyId is required" }); controller.close(); return; }

        const story = await prisma.story.findUnique({ where: { id: storyId } });
        if (!story) { send("error", { message: "Story not found" }); controller.close(); return; }

        const femaleAppearance = story.femaleAppearance || "an attractive woman";
        const faceDescription = (story as any).faceDescription || undefined;
        const sections = extractStorySections(story.content);
        if (sections.length === 0 && mode !== "hero") { send("error", { message: "No sections found in story" }); controller.close(); return; }

        const doSections = mode === "all" || mode === "sections";
        const doHero = mode === "all" || mode === "hero";
        const totalSteps = (doSections ? sections.length : 0) + (doHero ? 1 : 0);

        const imagesDir = path.join(process.cwd(), "public", "images", "stories", storyId);
        await mkdir(imagesDir, { recursive: true });
        console.log(`[generate-images] storyId=${storyId}, mode=${mode}, sections=${sections.length}, imagesDir=${imagesDir}`);

        if (mode === "all") {
          // Full regeneration — delete everything first
          send("status", { step: "cleanup", message: "Deleting old images...", current: 0, total: totalSteps });
          try { await rm(imagesDir, { recursive: true, force: true }); } catch (e: any) { console.log(`[generate-images] rm failed: ${e.message}`); }
          await prisma.storyImage.deleteMany({ where: { storyId } });
          await mkdir(imagesDir, { recursive: true });
        }

        let generated = 0;
        let stepNum = 0;

        // Section images
        if (doSections) {
          if (mode === "sections") {
            // Delete only section images, keep hero
            send("status", { step: "cleanup", message: "Deleting old section images...", current: 0, total: totalSteps });
            await prisma.storyImage.deleteMany({ where: { storyId } });
            for (let i = 0; i < sections.length; i++) {
              const f = path.join(imagesDir, `section-${i}.webp`);
              const ft = path.join(imagesDir, `section-${i}-thumb.webp`);
              try { await rm(f, { force: true }); } catch {}
              try { await rm(ft, { force: true }); } catch {}
            }
          }

          for (let i = 0; i < sections.length; i++) {
            stepNum++;
            const section = sections[i];
            const sceneDescription = summarizeForImagePrompt(section.content);
            const prompt = buildImagePrompt(femaleAppearance, sceneDescription, story.city || undefined, story.intensity, i, sections.length, faceDescription);

            send("status", { step: "image", message: `Generating image ${i + 1}/${sections.length}...`, detail: section.heading, current: stepNum, total: totalSteps });

            try {
              const b64Image = await generateImage(prompt);
              console.log(`[generate-images] Image ${i} b64 length: ${b64Image?.length || 0}`);
              const filename = `section-${i}.webp`;
              const imageBuffer = Buffer.from(b64Image, "base64");
              const fullPath = path.join(imagesDir, filename);
              await sharp(imageBuffer).webp({ quality: 80 }).toFile(fullPath);
              await sharp(imageBuffer).resize(150).webp({ quality: 60 }).toFile(path.join(imagesDir, `section-${i}-thumb.webp`));
              console.log(`[generate-images] Wrote ${fullPath}`);

              await prisma.storyImage.upsert({
                where: { storyId_sectionIdx: { storyId, sectionIdx: i } },
                update: { heading: section.heading, prompt, filename: `/images/stories/${storyId}/${filename}` },
                create: { storyId, sectionIdx: i, heading: section.heading, prompt, filename: `/images/stories/${storyId}/${filename}` },
              });

              generated++;
              send("status", { step: "image_done", message: `Image ${i + 1}/${sections.length} done`, detail: section.heading, current: stepNum, total: totalSteps });
            } catch (imgError: any) {
              send("status", { step: "image_error", message: `Image ${i + 1} failed: ${imgError.message}`, detail: section.heading, current: stepNum, total: totalSteps });
            }
          }
        }

        // Hero image
        let heroGenerated = false;
        if (doHero) {
          stepNum++;
          if (mode === "hero") {
            send("status", { step: "cleanup", message: "Deleting old hero image...", current: 0, total: totalSteps });
            try { await rm(path.join(imagesDir, "hero.webp"), { force: true }); } catch {}
            try { await rm(path.join(imagesDir, "hero-thumb.webp"), { force: true }); } catch {}
          }

          send("status", { step: "hero", message: "Generating hero image...", current: stepNum, total: totalSteps });
          try {
            const heroContext = [story.city || "", story.title, sections[0]?.content?.substring(0, 200) || ""].filter(Boolean).join(", ");
            const heroPrompt = `(masterpiece, best quality, ultra detailed, 8k, cinematic:1.4), atmospheric landscape photography, ${heroContext}, no people, no characters, dramatic lighting, wide angle, moody, cinematic color grading`;
            const heroB64 = await generateImage(heroPrompt, 1280, 720);
            console.log(`[generate-images] Hero b64 length: ${heroB64?.length || 0}`);
            const heroBuffer = Buffer.from(heroB64, "base64");
            await sharp(heroBuffer).webp({ quality: 80 }).toFile(path.join(imagesDir, "hero.webp"));
            await sharp(heroBuffer).resize(150).webp({ quality: 60 }).toFile(path.join(imagesDir, "hero-thumb.webp"));
            console.log(`[generate-images] Wrote hero.webp`);
            await prisma.story.update({ where: { id: storyId }, data: { heroImage: `/images/stories/${storyId}/hero.webp` } as any });
            heroGenerated = true;
            send("status", { step: "hero_done", message: "Hero image done!", current: stepNum, total: totalSteps });
          } catch (heroErr: any) {
            send("status", { step: "hero_error", message: `Hero image failed: ${heroErr.message}`, current: stepNum, total: totalSteps });
          }
        }

        send("done", { generated, heroGenerated, total: sections.length });
        controller.close();
      } catch (error: any) {
        send("error", { message: error.message || "Error generating images" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
