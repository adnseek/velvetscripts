import sharp from "sharp";
import path from "path";
import { readdir, stat } from "fs/promises";

const STORIES_DIR = path.join(process.cwd(), "public", "images", "stories");
const THUMB_SIZE = 150;
const THUMB_QUALITY = 60;

async function generateThumbnails() {
  console.log("🔍 Scanning stories directory...");

  let storyDirs: string[];
  try {
    storyDirs = await readdir(STORIES_DIR);
  } catch {
    console.log("❌ No stories directory found at", STORIES_DIR);
    return;
  }

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const storyId of storyDirs) {
    const storyDir = path.join(STORIES_DIR, storyId);
    const dirStat = await stat(storyDir);
    if (!dirStat.isDirectory()) continue;

    const files = await readdir(storyDir);
    const imageFiles = files.filter(
      (f) => f.endsWith(".webp") && !f.includes("-thumb")
    );

    for (const file of imageFiles) {
      const thumbName = file.replace(".webp", "-thumb.webp");
      if (files.includes(thumbName)) {
        totalSkipped++;
        continue;
      }

      const srcPath = path.join(storyDir, file);
      const thumbPath = path.join(storyDir, thumbName);

      try {
        await sharp(srcPath)
          .resize(THUMB_SIZE)
          .webp({ quality: THUMB_QUALITY })
          .toFile(thumbPath);
        totalCreated++;
        console.log(`  ✅ ${storyId}/${thumbName}`);
      } catch (err: any) {
        console.error(`  ❌ ${storyId}/${file}: ${err.message}`);
      }
    }
  }

  console.log(`\n🎉 Done! Created: ${totalCreated}, Skipped (already exist): ${totalSkipped}`);
}

generateThumbnails();
