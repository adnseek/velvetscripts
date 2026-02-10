import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — admin: list all submissions
export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(submissions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
