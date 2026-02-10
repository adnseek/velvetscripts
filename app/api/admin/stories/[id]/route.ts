import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stories = await db.stories.getAll();
    const story = stories.find(s => s.id === params.id);

    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ story });
  } catch (error: any) {
    console.error("Error loading story:", error);
    return NextResponse.json(
      { error: error.message || "Error loading story" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const story = await db.stories.update(params.id, data);

    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, story });
  } catch (error: any) {
    console.error("Error updating story:", error);
    return NextResponse.json(
      { error: error.message || "Error updating story" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.stories.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting story:", error);
    return NextResponse.json(
      { error: error.message || "Error deleting story" },
      { status: 500 }
    );
  }
}
