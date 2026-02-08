import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const story = await db.stories.create({
      title: data.title,
      slug: data.slug,
      content: data.content,
      theme: data.theme,
      style: data.style,
      excerpt: data.excerpt || data.content.substring(0, 200) + "...",
      published: data.published || false,
      seoTitle: data.seoTitle || data.title,
      seoDescription: data.seoDescription || data.excerpt,
      femaleAppearance: data.femaleAppearance || null,
      storyType: data.storyType || "real",
      intensity: data.intensity || 5,
      city: data.city || null,
      locationId: data.locationId || null,
    });

    return NextResponse.json({ success: true, story });
  } catch (error: any) {
    console.error("Fehler beim Speichern der Story:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Speichern" },
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
      { error: error.message || "Fehler beim Laden" },
      { status: 500 }
    );
  }
}
