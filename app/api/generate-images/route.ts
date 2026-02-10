import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateImage, buildImagePrompt, extractStorySections, summarizeForImagePrompt } from "@/lib/venice";
import { mkdir, rm } from "fs/promises";
import path from "path";
import sharp from "sharp";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const { storyId } = await request.json();
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
        const sections = extractStorySections(story.content);
        if (sections.length === 0) { send("error", { message: "No sections found in story" }); controller.close(); return; }

        const totalSteps = sections.length + 1; // sections + hero

        // Delete old images
        send("status", { step: "cleanup", message: "Deleting old images...", current: 0, total: totalSteps });
        const imagesDir = path.join(process.cwd(), "public", "images", "stories", storyId);
        console.log(`[generate-images] storyId=${storyId}, sections=${sections.length}, imagesDir=${imagesDir}`);
        try { await rm(imagesDir, { recursive: true, force: true }); console.log(`[generate-images] Deleted old dir`); } catch (e: any) { console.log(`[generate-images] rm failed: ${e.message}`); }
        await prisma.storyImage.deleteMany({ where: { storyId } });
        await mkdir(imagesDir, { recursive: true });
        console.log(`[generate-images] Created fresh dir`);

        let generated = 0;

        // Section images
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i];
          const sceneDescription = summarizeForImagePrompt(section.content);
          const prompt = buildImagePrompt(femaleAppearance, sceneDescription, story.city || undefined, story.intensity);

          send("status", { step: "image", message: `Generating image ${i + 1}/${sections.length}...`, detail: section.heading, current: i + 1, total: totalSteps });

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
            send("status", { step: "image_done", message: `Image ${i + 1}/${sections.length} done`, detail: section.heading, current: i + 1, total: totalSteps });
          } catch (imgError: any) {
            send("status", { step: "image_error", message: `Image ${i + 1} failed: ${imgError.message}`, detail: section.heading, current: i + 1, total: totalSteps });
          }
        }

        // Hero image
        send("status", { step: "hero", message: "Generating hero image...", current: totalSteps, total: totalSteps });
        let heroGenerated = false;
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
          send("status", { step: "hero_done", message: "Hero image done!", current: totalSteps, total: totalSteps });
        } catch (heroErr: any) {
          send("status", { step: "hero_error", message: `Hero image failed: ${heroErr.message}`, current: totalSteps, total: totalSteps });
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
