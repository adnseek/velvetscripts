import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateImage, buildImagePrompt, extractStorySections, summarizeForImagePrompt } from "@/lib/venice";
import { mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const { storyId } = await request.json();

    if (!storyId) {
      return NextResponse.json({ error: "storyId is required" }, { status: 400 });
    }

    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const femaleAppearance = story.femaleAppearance || "an attractive woman";
    const sections = extractStorySections(story.content);

    if (sections.length === 0) {
      return NextResponse.json({ error: "No sections found in story" }, { status: 400 });
    }

    // Ensure the images directory exists
    const imagesDir = path.join(process.cwd(), "public", "images", "stories", storyId);
    await mkdir(imagesDir, { recursive: true });

    const generatedImages: Array<{
      sectionIdx: number;
      heading: string;
      filename: string;
      prompt: string;
    }> = [];

    // Generate an image for each section
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const sceneDescription = summarizeForImagePrompt(section.content);

      const prompt = buildImagePrompt(
        femaleAppearance,
        sceneDescription,
        story.city || undefined,
      );

      console.log(`Generating image ${i + 1}/${sections.length} for section: "${section.heading}"`);

      try {
        const b64Image = await generateImage(prompt);

        // Convert to WebP and save to disk
        const filename = `section-${i}.webp`;
        const filepath = path.join(imagesDir, filename);
        const imageBuffer = Buffer.from(b64Image, "base64");
        await sharp(imageBuffer).webp({ quality: 80 }).toFile(filepath);

        // Save to database
        await prisma.storyImage.upsert({
          where: {
            storyId_sectionIdx: {
              storyId,
              sectionIdx: i,
            },
          },
          update: {
            heading: section.heading,
            prompt,
            filename: `/images/stories/${storyId}/${filename}`,
          },
          create: {
            storyId,
            sectionIdx: i,
            heading: section.heading,
            prompt,
            filename: `/images/stories/${storyId}/${filename}`,
          },
        });

        generatedImages.push({
          sectionIdx: i,
          heading: section.heading,
          filename: `/images/stories/${storyId}/${filename}`,
          prompt,
        });
      } catch (imgError: any) {
        console.error(`Error generating image for section ${i}:`, imgError.message);
        generatedImages.push({
          sectionIdx: i,
          heading: section.heading,
          filename: "",
          prompt,
        });
      }
    }

    return NextResponse.json({
      success: true,
      images: generatedImages,
      total: sections.length,
      generated: generatedImages.filter(img => img.filename).length,
    });
  } catch (error: any) {
    console.error("Error generating images:", error);
    return NextResponse.json(
      { error: error.message || "Error generating images" },
      { status: 500 }
    );
  }
}
