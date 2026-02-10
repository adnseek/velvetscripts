import { prisma } from "./prisma";
import nodemailer from "nodemailer";

function getMailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

interface NewStoryInfo {
  title: string;
  slug: string;
  storyType: string;
  excerpt: string;
  city?: string | null;
}

export async function notifySubscribers(story: NewStoryInfo) {
  const subscribers = await prisma.subscriber.findMany({
    where: { active: true },
  });

  if (subscribers.length === 0) {
    console.log("  📧 No active subscribers to notify");
    return;
  }

  const siteUrl = process.env.SITE_URL || "https://velvetscripts.com";
  const storyUrl = `${siteUrl}/story/${story.slug}`;
  const typeLabel = story.storyType === "tabu" ? "Taboo" : story.storyType === "fictional" ? "Fictional" : "Real";

  console.log(`  📧 Notifying ${subscribers.length} subscribers about "${story.title}"...`);

  const transporter = getMailTransporter();
  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    const unsubUrl = `${siteUrl}/api/unsubscribe?key=${sub.unsubscribeKey}`;

    try {
      await transporter.sendMail({
        from: `"VelvetScripts" <${process.env.SMTP_USER}>`,
        to: sub.email,
        subject: `🔥 New ${typeLabel} Story: ${story.title}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#111;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="text-align:center;margin-bottom:30px">
      <h1 style="color:#fff;font-size:28px;margin:0">
        Velvet<span style="color:#bc002d">Scripts</span>
      </h1>
      <p style="color:#666;font-size:11px;text-transform:uppercase;letter-spacing:3px;margin-top:4px">Hot Story Magazine</p>
    </div>

    <div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:30px;margin-bottom:20px">
      <div style="margin-bottom:16px">
        <span style="background:#2a0a0a;color:#bc002d;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px">${typeLabel}</span>
        ${story.city ? `<span style="color:#666;font-size:12px;margin-left:8px">· ${story.city}</span>` : ""}
      </div>
      <h2 style="color:#fff;font-size:24px;margin:0 0 12px 0;line-height:1.3">${story.title}</h2>
      <p style="color:#999;font-size:14px;line-height:1.6;margin:0 0 24px 0">${story.excerpt}</p>
      <a href="${storyUrl}" style="display:inline-block;background:#bc002d;color:#fff;padding:14px 32px;text-decoration:none;border-radius:4px;font-weight:bold;font-size:14px;text-transform:uppercase;letter-spacing:2px">
        Read Now →
      </a>
    </div>

    <div style="text-align:center;padding-top:20px;border-top:1px solid #222">
      <p style="color:#555;font-size:11px;margin:0">
        You're receiving this because you subscribed to VelvetScripts.
      </p>
      <a href="${unsubUrl}" style="color:#666;font-size:11px;text-decoration:underline;margin-top:8px;display:inline-block">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`,
      });
      sent++;
    } catch (e: any) {
      console.error(`  ❌ Failed to send to ${sub.email}: ${e.message}`);
      failed++;
    }
  }

  console.log(`  📧 Sent: ${sent}, Failed: ${failed}`);
}
