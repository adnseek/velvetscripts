/**
 * One-time script to fix existing stories with bad excerpts
 * (containing markdown headings like "# Title" at the start).
 * 
 * Run with: npx tsx scripts/fix-excerpts.ts
 */
import { prisma } from "../lib/prisma";
import { generateExcerpt } from "../lib/excerpt";

async function main() {
  const stories = await prisma.story.findMany({
    select: { id: true, title: true, excerpt: true, content: true },
  });

  let fixed = 0;
  for (const story of stories) {
    // Check if excerpt starts with a markdown heading
    if (story.excerpt && /^#/.test(story.excerpt.trim())) {
      const newExcerpt = generateExcerpt(story.content);
      await prisma.story.update({
        where: { id: story.id },
        data: { excerpt: newExcerpt },
      });
      console.log(`✅ Fixed: "${story.title}"`);
      console.log(`   Old: ${story.excerpt.substring(0, 80)}...`);
      console.log(`   New: ${newExcerpt.substring(0, 80)}...`);
      fixed++;
    }
  }

  console.log(`\nDone. Fixed ${fixed}/${stories.length} stories.`);
  await prisma.$disconnect();
}

main().catch(console.error);
