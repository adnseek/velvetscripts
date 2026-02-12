import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateImage, buildImagePrompt, extractStorySections, summarizeSceneWithGrok } from "@/lib/venice";
import { mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const { storyId, sectionIdx } = await request.json();

    if (!storyId || sectionIdx === undefined) {
      return NextResponse.json({ error: "storyId and sectionIdx required" }, { status: 400 });
    }

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const femaleAppearance = story.femaleAppearance || "an attractive woman";
    const faceDescription = (story as any).faceDescription || undefined;
    const sections = extractStorySections(story.content);

    if (sectionIdx >= sections.length) {
      return NextResponse.json({ error: `Section ${sectionIdx} not found (${sections.length} sections)` }, { status: 400 });
    }

    const section = sections[sectionIdx];
    const sceneDescription = await summarizeSceneWithGrok(section.content, section.heading);
    const prompt = buildImagePrompt(femaleAppearance, sceneDescription, story.city || undefined, story.intensity, sectionIdx, sections.length, faceDescription);

    // Generate with up to 3 retries
    let b64Image: string | null = null;
    let lastError = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        b64Image = await generateImage(prompt);
        if (b64Image && b64Image.length > 100) break;
        b64Image = null;
      } catch (e: any) {
        lastError = e.message;
        console.log(`[generate-single-image] Attempt ${attempt + 1} failed: ${e.message}`);
      }
    }

    if (!b64Image) {
      return NextResponse.json({ error: `Image generation failed after 3 attempts: ${lastError}` }, { status: 500 });
    }

    const imagesDir = path.join(process.cwd(), "public", "images", "stories", storyId);
    await mkdir(imagesDir, { recursive: true });

    const filename = `section-${sectionIdx}.webp`;
    const imageBuffer = Buffer.from(b64Image, "base64");
    await sharp(imageBuffer).webp({ quality: 80 }).toFile(path.join(imagesDir, filename));
    await sharp(imageBuffer).resize(150).webp({ quality: 60 }).toFile(path.join(imagesDir, `section-${sectionIdx}-thumb.webp`));

    const publicPath = `/images/stories/${storyId}/${filename}`;

    await prisma.storyImage.upsert({
      where: { storyId_sectionIdx: { storyId, sectionIdx } },
      update: { heading: section.heading, prompt, filename: publicPath },
      create: { storyId, sectionIdx, heading: section.heading, prompt, filename: publicPath },
    });

    return NextResponse.json({ success: true, filename: publicPath, heading: section.heading });
  } catch (error: any) {
    console.error("[generate-single-image] Error:", error);
    return NextResponse.json({ error: error.message || "Error generating image" }, { status: 500 });
  }
}
