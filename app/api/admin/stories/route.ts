import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { generateExcerpt } from "@/lib/excerpt";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Ensure unique slug
    let slug = data.slug;
    let suffix = 2;
    while (await prisma.story.findUnique({ where: { slug } })) {
      slug = `${data.slug}-${suffix}`;
      suffix++;
    }
    
    const story = await db.stories.create({
      title: data.title,
      slug,
      content: data.content,
      theme: data.theme,
      style: data.style,
      excerpt: data.excerpt || generateExcerpt(data.content),
      published: data.published || false,
      seoTitle: data.seoTitle || data.title,
      seoDescription: data.seoDescription || data.excerpt,
      femaleAppearance: data.femaleAppearance || null,
      characterName: data.characterName || null,
      faceDescription: data.faceDescription || null,
      portraitImage: data.portraitImage || null,
      quote: data.quote || null,
      storyType: data.storyType || "real",
      intensity: data.intensity || 5,
      city: data.city || null,
      locationId: data.locationId || null,
    });

    return NextResponse.json({ success: true, story });
  } catch (error: any) {
    console.error("Error saving story:", error);
    return NextResponse.json(
      { error: error.message || "Error saving story" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stories = await db.stories.getAll();
    return NextResponse.json({ stories });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error loading stories" },
      { status: 500 }
    );
  }
}
