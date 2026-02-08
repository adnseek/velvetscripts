import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storyType = searchParams.get("storyType");

    const locations = await prisma.location.findMany({
      where: storyType ? { storyType } : undefined,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ locations });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Fehler beim Laden" },
      { status: 500 }
    );
  }
}
