import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = path.join(process.cwd(), "public", "images", ...params.path);

    // Security: prevent directory traversal
    const resolved = path.resolve(filePath);
    const publicDir = path.resolve(path.join(process.cwd(), "public", "images"));
    if (!resolved.startsWith(publicDir)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=2592000, immutable",
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return new NextResponse("Not found", { status: 404 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
