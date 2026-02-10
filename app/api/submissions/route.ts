import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST — public: submit a story
export async function POST(request: NextRequest) {
  try {
    const { authorName, authorEmail, title, content } = await request.json();

    if (!authorName?.trim() || !title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Author name, title, and content are required" },
        { status: 400 }
      );
    }

    if (content.trim().length < 100) {
      return NextResponse.json(
        { error: "Story must be at least 100 characters long" },
        { status: 400 }
      );
    }

    const submission = await prisma.submission.create({
      data: {
        authorName: authorName.trim(),
        authorEmail: authorEmail?.trim() || null,
        title: title.trim(),
        content: content.trim(),
      },
    });

    return NextResponse.json({ success: true, id: submission.id });
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: error.message || "Error submitting story" },
      { status: 500 }
    );
  }
}
