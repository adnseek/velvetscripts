/**
 * Import a story from an exported story.json file + images.
 * Expects the export folder structure:
 *   exports/<slug>/story.json
 *   exports/<slug>/images/  (hero.webp, hero-thumb.webp, section-0.webp, etc.)
 *
 * Usage: npx tsx scripts/import-story.ts exports/<slug>/story.json
 */
import { prisma } from "../lib/prisma";
import { mkdir, copyFile, readdir, stat } from "fs/promises";
import { readFileSync } from "fs";
import path from "path";

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error("Usage: npx tsx scripts/import-story.ts <path-to-story.json>");
    process.exit(1);
  }

  const raw = readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(raw);

  console.log(`📖 Importing: "${data.title}" (${data.slug})`);

  // Check if story already exists
  const existing = await prisma.story.findUnique({ where: { slug: data.slug } });
  if (existing) {
    console.error(`❌ Story with slug "${data.slug}" already exists (id: ${existing.id}). Skipping.`);
    await prisma.$disconnect();
    process.exit(1);
  }

  // Find or skip location
  let locationId: string | null = null;
  if (data.location) {
    const loc = await prisma.location.findFirst({
      where: { name: data.location.name, storyType: data.location.storyType },
    });
    if (loc) {
      locationId = loc.id;
      console.log(`  📍 Linked to location: ${loc.name}`);
    } else {
      console.log(`  ⚠️  Location "${data.location.name}" not found, skipping link`);
    }
  }

  // Create story
  const story = await prisma.story.create({
    data: {
      slug: data.slug,
      title: data.title,
      content: data.content,
      theme: data.theme || "romantic",
      style: data.style || "passionate",
      excerpt: data.excerpt || "",
      published: data.published ?? true,
      views: data.views || 0,
      seoTitle: data.seoTitle || data.title,
      seoDescription: data.seoDescription || "",
      femaleAppearance: data.femaleAppearance || null,
      storyType: data.storyType || "real",
      intensity: data.intensity || 5,
      city: data.city || null,
      heroImage: data.heroImage || null,
      locationId,
    },
  });

  console.log(`  💾 Story created: ${story.id}`);

  // Copy images
  const exportDir = path.dirname(jsonPath);
  const imagesSourceDir = path.join(exportDir, "images");
  const imagesDestDir = path.join(process.cwd(), "public", "images", "stories", story.id);

  try {
    const files = await readdir(imagesSourceDir);
    await mkdir(imagesDestDir, { recursive: true });

    for (const file of files) {
      const src = path.join(imagesSourceDir, file);
      const dest = path.join(imagesDestDir, file);
      const s = await stat(src);
      if (s.isFile()) {
        await copyFile(src, dest);
        console.log(`  📷 ${file}`);
      }
    }
    console.log(`  ✅ ${files.length} image files copied`);

  } catch (e: any) {
    if (e.code === "ENOENT") {
      console.log("  ⚠️  No images directory found in export, skipping image files");
    } else {
      throw e;
    }
  }

  // Update heroImage path with new story ID (always, even without image files)
  if (data.heroImage) {
    const heroFilename = path.basename(data.heroImage);
    const newHeroPath = `/images/stories/${story.id}/${heroFilename}`;
    await prisma.story.update({
      where: { id: story.id },
      data: { heroImage: newHeroPath },
    });
    console.log(`  🖼️ Hero image path updated: ${newHeroPath}`);
  }

  // Create StoryImage records
  if (data.images && data.images.length > 0) {
    for (const img of data.images) {
      const filename = path.basename(img.filename);
      const newPath = `/images/stories/${story.id}/${filename}`;
      await prisma.storyImage.create({
        data: {
          storyId: story.id,
          sectionIdx: img.sectionIdx,
          heading: img.heading || null,
          prompt: img.prompt || "",
          filename: newPath,
          width: img.width || 1024,
          height: img.height || 1024,
        },
      });
    }
    console.log(`  ✅ ${data.images.length} StoryImage records created`);
  }

  console.log(`\n🎉 Import complete! Story available at /story/${data.slug}`);

  await prisma.$disconnect();
}

main().catch(console.error);
