import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH — admin: update submission status (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, adminNote } = await request.json();

    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'approved', 'rejected', or 'pending'" },
        { status: 400 }
      );
    }

    const submission = await prisma.submission.update({
      where: { id: params.id },
      data: {
        status,
        adminNote: adminNote || null,
      },
    });

    return NextResponse.json(submission);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — admin: delete submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.submission.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
