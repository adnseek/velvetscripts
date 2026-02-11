import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "robots.txt");
    const content = await readFile(filePath, "utf-8");
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("User-agent: *\nAllow: /\n", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
