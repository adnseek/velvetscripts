import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const { storyId, characterName: inputName, quote: inputQuote } = await request.json();
    if (!storyId) {
      return NextResponse.json({ error: "storyId is required" }, { status: 400 });
    }

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const imagesDir = path.join(process.cwd(), "public", "images", "stories", storyId);
    const heroPath = path.join(imagesDir, "hero.webp");
    const portraitPath = path.join(imagesDir, "portrait.webp");

    // Check if both source images exist
    let heroBuffer: Buffer;
    let portraitBuffer: Buffer;
    try {
      heroBuffer = await readFile(heroPath);
    } catch {
      return NextResponse.json({ error: "Hero image not found. Generate it first." }, { status: 400 });
    }
    try {
      portraitBuffer = await readFile(portraitPath);
    } catch {
      return NextResponse.json({ error: "Portrait image not found. Generate it first." }, { status: 400 });
    }

    // Use values from request body (current UI state) or fall back to DB
    const name = inputName || (story as any).characterName || "Unknown";
    const quote = inputQuote !== undefined ? inputQuote : ((story as any).quote || "");

    // 1. Hero as darkened background (1200x675 = 16:9 for X/Twitter)
    const background = await sharp(heroBuffer)
      .resize(1200, 675, { fit: "cover" })
      .modulate({ brightness: 0.5 })
      .toBuffer();

    // 2. Passport photo with white border
    const passport = await sharp(portraitBuffer)
      .resize(280, 350, { fit: "cover" })
      .extend({
        top: 8, bottom: 8, left: 8, right: 8,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .toBuffer();

    // 3. Text overlay as SVG (sharp supports SVG compositing)
    const escapedName = escapeXml(name);
    const escapedQuote = escapeXml(quote);

    // Word-wrap the quote to fit the available space
    const quoteLines = wordWrap(quote, 26);
    const quoteSvgLines = quoteLines.map((line, i) =>
      `<text x="0" y="${i * 44}" font-family="Georgia, serif" font-size="34" font-style="italic" fill="white" opacity="0.95">${i === 0 ? '\u201C' : ''}${escapeXml(line)}${i === quoteLines.length - 1 ? '\u201D' : ''}</text>`
    ).join("\n");

    const textSvg = Buffer.from(`
      <svg width="720" height="520" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="60" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="bold" fill="white" letter-spacing="2">
          ${escapedName}
        </text>
        <line x1="0" y1="82" x2="160" y2="82" stroke="#e11d48" stroke-width="5"/>
        <g transform="translate(0, 125)">
          ${quoteSvgLines}
        </g>
        <text x="0" y="${155 + quoteLines.length * 44 + 40}" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#e11d48" font-weight="bold" letter-spacing="4">
          VELVETSCRIPTS.COM
        </text>
      </svg>
    `);

    // 4. Compose everything
    const composite = await sharp(background)
      .composite([
        {
          input: passport,
          top: 130,
          left: 50,
        },
        {
          input: textSvg,
          top: 80,
          left: 460,
        },
      ])
      .webp({ quality: 90 })
      .toBuffer();

    // Save to disk
    await mkdir(imagesDir, { recursive: true });
    const compositePath = path.join(imagesDir, "x-composite.webp");
    await sharp(composite).toFile(compositePath);

    // Also save as JPG for X/Twitter compatibility
    await sharp(composite).jpeg({ quality: 90 }).toFile(path.join(imagesDir, "x-composite.jpg"));

    return NextResponse.json({
      success: true,
      compositeImage: `/images/stories/${storyId}/x-composite.webp`,
      compositeJpg: `/images/stories/${storyId}/x-composite.jpg`,
    });
  } catch (error: any) {
    console.error("Composite generation failed:", error);
    return NextResponse.json({ error: error.message || "Composite generation failed" }, { status: 500 });
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wordWrap(text: string, maxChars: number): string[] {
  if (!text) return [];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (current.length + word.length + 1 > maxChars && current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}
