import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");

  if (!key) {
    return new NextResponse(html("Missing unsubscribe key."), { headers: { "Content-Type": "text/html" } });
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { unsubscribeKey: key },
  });

  if (!subscriber) {
    return new NextResponse(html("Invalid unsubscribe link."), { headers: { "Content-Type": "text/html" } });
  }

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { active: false },
  });

  return new NextResponse(
    html("You have been unsubscribed. You will no longer receive emails from VelvetScripts."),
    { headers: { "Content-Type": "text/html" } }
  );
}

function html(message: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>VelvetScripts</title></head>
<body style="background:#111;color:#e8e8e8;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
  <div style="text-align:center;max-width:400px;padding:2rem">
    <h1 style="color:#bc002d;font-size:2rem;margin-bottom:1rem">VelvetScripts</h1>
    <p style="color:#999;line-height:1.6">${message}</p>
    <a href="/" style="display:inline-block;margin-top:2rem;color:#bc002d;text-decoration:none">← Back to Homepage</a>
  </div>
</body>
</html>`;
}
