import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { storyId, images, heroImage } = await request.json();

    if (!storyId) {
      return NextResponse.json({ error: "storyId required" }, { status: 400 });
    }

    // Ensure the images directory exists
    const imagesDir = path.join(process.cwd(), "public", "images", "stories", storyId);
    await mkdir(imagesDir, { recursive: true });

    // Save hero image if provided
    if (heroImage?.b64) {
      const heroFilename = "hero.jpg";
      const heroFilepath = path.join(imagesDir, heroFilename);
      const heroPublicPath = `/images/stories/${storyId}/${heroFilename}`;

      const heroBuffer = Buffer.from(heroImage.b64, "base64");
      await writeFile(heroFilepath, heroBuffer);

      await prisma.story.update({
        where: { id: storyId },
        data: { heroImage: heroPublicPath },
      });
    }

    const saved: Array<{ sectionIdx: number; filename: string }> = [];

    for (const img of (images || [])) {
      if (!img.b64) continue;

      const filename = `section-${img.sectionIdx}.jpg`;
      const filepath = path.join(imagesDir, filename);
      const publicPath = `/images/stories/${storyId}/${filename}`;

      // Write image to disk
      const imageBuffer = Buffer.from(img.b64, "base64");
      await writeFile(filepath, imageBuffer);

      // Save to database
      await prisma.storyImage.upsert({
        where: {
          storyId_sectionIdx: {
            storyId,
            sectionIdx: img.sectionIdx,
          },
        },
        update: {
          heading: img.heading || null,
          prompt: img.prompt || "",
          filename: publicPath,
        },
        create: {
          storyId,
          sectionIdx: img.sectionIdx,
          heading: img.heading || null,
          prompt: img.prompt || "",
          filename: publicPath,
        },
      });

      saved.push({ sectionIdx: img.sectionIdx, filename: publicPath });
    }

    return NextResponse.json({
      success: true,
      saved: saved.length,
    });
  } catch (error: any) {
    console.error("Error saving images:", error);
    return NextResponse.json(
      { error: error.message || "Error saving images" },
      { status: 500 }
    );
  }
}
