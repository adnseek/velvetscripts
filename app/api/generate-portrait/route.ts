import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateImage } from "@/lib/venice";
import { mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const { storyId } = await request.json();
    if (!storyId) {
      return NextResponse.json({ error: "storyId is required" }, { status: 400 });
    }

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const faceDescription = story.faceDescription;
    if (!faceDescription) {
      return NextResponse.json({ error: "No face description available for this story" }, { status: 400 });
    }

    const portraitPrompt = `(biometric passport photo:1.5, official ID document photo:1.4), (1woman, solo, looking straight at camera, neutral expression, mouth closed:1.4), ${faceDescription}, plain light gray background, flat even lighting, no shadows, sharp focus, no smile, no emotion, clinical, boring, government ID style, natural skin, no makeup, no retouching, head centered, ears visible, no accessories`;

    const b64 = await generateImage(portraitPrompt, 768, 768);

    // Save to disk
    const imagesDir = path.join(process.cwd(), "public", "images", "stories", storyId);
    await mkdir(imagesDir, { recursive: true });

    const portraitBuffer = Buffer.from(b64, "base64");
    await sharp(portraitBuffer).resize(768, 768, { fit: "cover" }).webp({ quality: 85 }).toFile(path.join(imagesDir, "portrait.webp"));
    await sharp(portraitBuffer).resize(150).webp({ quality: 60 }).toFile(path.join(imagesDir, "portrait-thumb.webp"));

    const portraitPath = `/images/stories/${storyId}/portrait.webp`;
    await prisma.story.update({
      where: { id: storyId },
      data: { portraitImage: portraitPath },
    });

    return NextResponse.json({ success: true, portraitImage: portraitPath });
  } catch (error: any) {
    console.error("Portrait generation failed:", error);
    return NextResponse.json({ error: error.message || "Portrait generation failed" }, { status: 500 });
  }
}
