import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const existing = await prisma.subscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (existing.active) {
        return NextResponse.json({ message: "You're already subscribed!" });
      }
      // Re-activate
      await prisma.subscriber.update({
        where: { id: existing.id },
        data: { active: true },
      });
      return NextResponse.json({ message: "Welcome back! Your subscription has been reactivated." });
    }

    await prisma.subscriber.create({
      data: { email: normalizedEmail },
    });

    return NextResponse.json({ message: "Successfully subscribed! You'll receive an email when new stories are published." });
  } catch (error: any) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
