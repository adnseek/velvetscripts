/**
 * Export a story by slug, including all images.
 * Creates a folder: exports/<slug>/ with story.json and all image files.
 *
 * Usage: npx tsx scripts/export-story.ts <slug>
 */
import { prisma } from "../lib/prisma";
import { mkdir, copyFile, readdir, stat } from "fs/promises";
import { writeFileSync } from "fs";
import path from "path";

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
  const exportDir = path.join(process.cwd(), "exports", slug);
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

  // Copy image files
  const imagesSourceDir = path.join(process.cwd(), "public", "images", "stories", story.id);
  try {
    const files = await readdir(imagesSourceDir);
    const imagesExportDir = path.join(exportDir, "images");
    await mkdir(imagesExportDir, { recursive: true });

    for (const file of files) {
      const src = path.join(imagesSourceDir, file);
      const dest = path.join(imagesExportDir, file);
      const s = await stat(src);
      if (s.isFile()) {
        await copyFile(src, dest);
        console.log(`  📷 ${file}`);
      }
    }
    console.log(`✅ ${files.length} image files copied to exports/${slug}/images/`);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      console.log("⚠️  No image files found (directory doesn't exist)");
    } else {
      throw e;
    }
  }

  console.log(`\n🎉 Export complete! Transfer the exports/${slug}/ folder to your server.`);
  console.log(`   Then run: npx tsx scripts/import-story.ts exports/${slug}/story.json`);

  await prisma.$disconnect();
}

main().catch(console.error);
