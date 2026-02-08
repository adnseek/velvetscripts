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
        { error: "Geschichte nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({ story });
  } catch (error: any) {
    console.error("Fehler beim Laden:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Laden" },
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
        { error: "Geschichte nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, story });
  } catch (error: any) {
    console.error("Fehler beim Aktualisieren:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Aktualisieren" },
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
    console.error("Fehler beim Löschen:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Löschen" },
      { status: 500 }
    );
  }
}
