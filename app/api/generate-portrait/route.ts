import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateImage } from "@/lib/venice";
import { mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyId, faceDescription: inputFaceDescription } = body;
    if (!storyId) {
      return NextResponse.json({ error: "storyId is required" }, { status: 400 });
    }

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const faceDescription = inputFaceDescription || story.faceDescription;
    if (!faceDescription) {
      return NextResponse.json({ error: "No face description available. Please enter one and try again." }, { status: 400 });
    }

    // Save updated faceDescription to DB if provided
    if (inputFaceDescription && inputFaceDescription !== story.faceDescription) {
      await prisma.story.update({ where: { id: storyId }, data: { faceDescription: inputFaceDescription } });
    }

    const pAgeMatch = (story.femaleAppearance || "").match(/(\d+)-year-old/);
    const pAge = pAgeMatch ? parseInt(pAgeMatch[1]) : 30;
    const pAgeTags = pAge >= 50 ? `(${pAge}-year-old woman:1.5), (mature, older woman, aged, wrinkles, crow's feet, aging skin:1.4)` : pAge >= 40 ? `(${pAge}-year-old woman:1.5), (mature woman, middle-aged:1.3)` : `(${pAge}-year-old woman:1.4)`;
    const cleanFace = faceDescription.replace(/smil\w*/gi, '').replace(/grin\w*/gi, '').replace(/laugh\w*/gi, '');
    const portraitPrompt = `(biometric passport photo:1.5, official ID document photo:1.4), (1woman, solo, looking straight at camera, serious expression, stern face, no smile, mouth closed, eyes wide open, eyes looking at camera:1.4), ${pAgeTags}, ${cleanFace}, plain light gray background, flat even lighting, no shadows, sharp focus, (no smile, no grin, no emotion, serious, stern:1.5), clinical, boring, government ID style, natural skin, no makeup, no retouching, head centered, ears visible, no accessories, (open eyes:1.5)`;

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
