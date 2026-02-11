/**
 * Export a story by slug, including all images.
 * Creates a folder: exports/<slug>/ with story.json and all image files.
 * If images don't exist locally, downloads them from the live server.
 *
 * Usage: npx tsx scripts/export-story.ts <slug>
 */
import { prisma } from "../lib/prisma";
import { mkdir, copyFile, readdir, stat, writeFile } from "fs/promises";
import { writeFileSync, existsSync } from "fs";
import path from "path";

const LIVE_URL = process.env.SITE_URL || "https://velvetscripts.com";
const PROJECT_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

async function downloadFile(url: string, dest: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buffer);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: npx tsx scripts/export-story.ts <slug>");
    process.exit(1);
  }

  const story = await prisma.story.findUnique({
    where: { slug },
    include: {
      location: true,
      images: { orderBy: { sectionIdx: "asc" } },
    },
  });

  if (!story) {
    console.error(`❌ Story not found: "${slug}"`);
    process.exit(1);
  }

  // Create export directory
  const exportDir = path.join(PROJECT_ROOT, "scripts", "exports", slug);
  await mkdir(exportDir, { recursive: true });

  // Export story data as JSON
  const storyData = {
    slug: story.slug,
    title: story.title,
    content: story.content,
    theme: story.theme,
    style: story.style,
    excerpt: story.excerpt,
    published: story.published,
    views: story.views,
    seoTitle: story.seoTitle,
    seoDescription: story.seoDescription,
    femaleAppearance: story.femaleAppearance,
    storyType: story.storyType,
    intensity: story.intensity,
    city: story.city,
    heroImage: story.heroImage,
    createdAt: story.createdAt.toISOString(),
    location: story.location ? { name: story.location.name, slug: story.location.slug, storyType: story.location.storyType } : null,
    images: story.images.map((img) => ({
      sectionIdx: img.sectionIdx,
      heading: img.heading,
      prompt: img.prompt,
      filename: img.filename,
      width: img.width,
      height: img.height,
    })),
  };

  writeFileSync(path.join(exportDir, "story.json"), JSON.stringify(storyData, null, 2));
  console.log(`✅ Story data exported to exports/${slug}/story.json`);

  // Collect all image paths to export
  const imagePaths: string[] = [];
  if (story.heroImage) imagePaths.push(story.heroImage);
  // Also check for hero thumbnail
  const heroThumb = story.heroImage?.replace(/\.webp$/, "-thumb.webp");
  if (heroThumb) imagePaths.push(heroThumb);
  for (const img of story.images) {
    imagePaths.push(img.filename);
  }

  const imagesExportDir = path.join(exportDir, "images");
  await mkdir(imagesExportDir, { recursive: true });

  let copied = 0;
  let downloaded = 0;

  for (const imgPath of imagePaths) {
    const filename = path.basename(imgPath);
    const dest = path.join(imagesExportDir, filename);
    const localPath = path.join(PROJECT_ROOT, "public", imgPath);

    // Try local copy first
    if (existsSync(localPath)) {
      await copyFile(localPath, dest);
      copied++;
      console.log(`  📷 ${filename} (local)`);
    } else {
      // Download from live server
      const url = `${LIVE_URL}${imgPath}`;
      const ok = await downloadFile(url, dest);
      if (ok) {
        downloaded++;
        console.log(`  📷 ${filename} (downloaded)`);
      } else {
        console.log(`  ⚠️  ${filename} — not found locally or on server`);
      }
    }
  }

  console.log(`✅ Images: ${copied} copied locally, ${downloaded} downloaded from server`);

  console.log(`\n🎉 Export complete! Transfer the exports/${slug}/ folder to your server.`);
  console.log(`   Then run: npx tsx scripts/import-story.ts exports/${slug}/story.json`);

  await prisma.$disconnect();
}

main().catch(console.error);
