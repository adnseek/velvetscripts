import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

async function sendDebugNotification(subscriberEmail: string, action: "new" | "reactivated") {
  if (process.env.DEBUG !== "true" || !process.env.DEBUG_EMAIL) return;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const totalCount = await prisma.subscriber.count({ where: { active: true } });

    await transporter.sendMail({
      from: `"VelvetScripts Debug" <${process.env.SMTP_USER}>`,
      to: process.env.DEBUG_EMAIL,
      subject: `📊 ${action === "new" ? "New" : "Reactivated"} Subscriber: ${subscriberEmail}`,
      html: `
        <div style="font-family:sans-serif;padding:20px;background:#111;color:#e8e8e8">
          <h2 style="color:#bc002d">Subscriber ${action === "new" ? "Added" : "Reactivated"}</h2>
          <p><strong>Email:</strong> ${subscriberEmail}</p>
          <p><strong>Total active subscribers:</strong> ${totalCount}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        </div>`,
    });
  } catch (e: any) {
    console.error("Debug notification failed:", e.message);
  }
}

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
      await sendDebugNotification(normalizedEmail, "reactivated");
      return NextResponse.json({ message: "Welcome back! Your subscription has been reactivated." });
    }

    await prisma.subscriber.create({
      data: { email: normalizedEmail },
    });

    await sendDebugNotification(normalizedEmail, "new");

    return NextResponse.json({ message: "Successfully subscribed! You'll receive an email when new stories are published." });
  } catch (error: any) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
