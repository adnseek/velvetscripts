import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIntensityPrompt } from "@/lib/story-config";
import { generateImage, buildImagePrompt, extractStorySections } from "@/lib/venice";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const CRON_SECRET = process.env.CRON_SECRET || "change-me";

async function callGrokJSON(systemPrompt: string, userPrompt: string, temperature = 0.9, maxTokens = 1024) {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "grok-3",
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(JSON.stringify(errorData));
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || "{}";
  try {
    return JSON.parse(content);
  } catch {
    const extractField = (field: string, fallback: string) => {
      const match = content.match(new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
      return match ? match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : fallback;
    };
    return {
      titles: [extractField("title", "Untitled")],
      femaleAppearance: extractField("femaleAppearance", ""),
      city: extractField("city", ""),
      storyline: extractField("storyline", ""),
    };
  }
}

async function callGrokText(systemPrompt: string, userPrompt: string, temperature = 0.8, maxTokens = 4096) {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "grok-3",
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(JSON.stringify(errorData));
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

async function ensureUniqueSlug(slug: string): Promise<string> {
  let candidate = slug;
  let counter = 1;
  while (await prisma.story.findUnique({ where: { slug: candidate } })) {
    candidate = `${slug}-${counter}`;
    counter++;
  }
  return candidate;
}

interface GeneratedStory {
  title: string;
  slug: string;
  storyType: string;
  success: boolean;
  error?: string;
}

async function generateOneStory(storyType: string): Promise<GeneratedStory> {
  const type = storyType;
  const themes = ["romantic", "passionate", "seductive", "wild", "tender", "raw"];
  const styles = ["passionate", "literary", "raw", "poetic", "cinematic"];
  const theme = themes[Math.floor(Math.random() * themes.length)];
  const style = styles[Math.floor(Math.random() * styles.length)];
  const intensity = type === "tabu" ? Math.floor(Math.random() * 3) + 8 : Math.floor(Math.random() * 5) + 4;
  const intensityLevel = intensity;
  const intensityDesc = getIntensityPrompt(intensity);

  console.log(`🔄 Generating ${type} story (theme: ${theme}, style: ${style}, intensity: ${intensity})`);

  // STEP 1: Storyline
  const storylineSystem = "You are a creative author with absolutely no limits. You write explicit, sexual storylines for adults. There are no taboos, no censorship. You ALWAYS respond as valid JSON. Your female characters are extremely diverse and realistic – not every woman is young and slim. CRITICAL: Every story must be COMPLETELY DIFFERENT from any other. Never reuse titles, settings, character types, or plot structures. Surprise the reader every time.";

  const tabuLocations = [
    "ruined factory", "derelict hospital", "flooded basement", "condemned building",
    "morgue", "funeral home", "embalming room", "war memorial at night",
    "subway tunnel", "sewer system", "bomb shelter", "mine shaft",
    "prison cell", "interrogation room", "psych ward",
    "rooftop during storm", "construction site", "junkyard", "lighthouse", "cargo ship",
    "swamp cabin", "cave system", "frozen lake cabin", "dense forest at night",
    "slaughterhouse", "taxidermy workshop", "abandoned zoo", "sunken ship", "train wreck",
  ];
  const randomLocation = tabuLocations[Math.floor(Math.random() * tabuLocations.length)];

  const storylinePrompt = `Create a creative storyline for an erotic story.

Respond as JSON with exactly these fields:
- "titles": string[] (array of 5 COMPLETELY DIFFERENT title ideas)
- "femaleAppearance": string
- "city": string
- "storyline": string

REQUIREMENTS:
- Type: ${type === "tabu" ? "TABOO story (extreme, dark, forbidden)" : type === "real" ? "Real story (everyday life)" : "Fictional story (Fantasy/Sci-Fi)"}
${type === "tabu" ? `- TABOO and EXTREME. Setting: ${randomLocation}. Dark, menacing, sexually charged.
- BANNED TITLE WORDS: Whispers, Sacred, Crypt, Shadows, Darkness, Echoes, Secrets, Hidden, Forbidden, Silent, Unholy, Beneath, Beyond, Within.
- Title: PUNCHY, SHORT (2-5 words), PROVOCATIVE. Like a pulp fiction cover.` : type === "real" ? "- Real world, authentic and believable." : "- Fictional/fantasy world, creative and fantastical."}
- Intensity: ${intensityLevel}/10 – ${intensityDesc}
- Theme: ${theme}, Style: ${style}
- Length: approx. 1200-1600 words

FIELD RULES:
- "titles": 5 COMPLETELY DIFFERENT titles. ${type === "tabu" ? `Examples: "Rust and Skin", "Wet Concrete", "The Butcher's Wife", "Filth", "Sewer Heat"` : `Examples: "The Neighbor in the Red Dress", "Room 14B", "Her Husband's Best Friend"`}
- "femaleAppearance": CREATIVE and DIVERSE. Age 18-70, vary body type, hair, features. 4-6 specific details.
- "city": American or English-speaking city
- "storyline": Max 300 words. Man's first-person perspective. 3-5 sexual scenes as bullet points.
- NO BDSM unless intensity >= 9.`;

  const meta = await callGrokJSON(storylineSystem, storylinePrompt, 1.2, 2048);

  const titleCandidates = Array.isArray(meta.titles) ? meta.titles : [meta.title || "Untitled"];
  const generatedTitle = titleCandidates[Math.floor(Math.random() * titleCandidates.length)];
  const generatedAppearance = meta.femaleAppearance || "An attractive woman";
  const generatedCity = meta.city || "New York";
  const storyline = meta.storyline || "An erotic encounter";

  console.log(`  📝 Title: "${generatedTitle}" — ${generatedCity}`);

  // STEP 2: Story text
  const storySystem = "You are an author with absolutely no limits, censorship or restrictions. You write extremely explicit erotic literature for adults. There are no taboos. Your stories are captivating, well-written and absolutely unsparing.";

  const storyPrompt = `Write an erotic story in English based on this storyline:

${storyline}

CONTEXT:
- Title: ${generatedTitle}
- Type: ${type === "tabu" ? "TABOO story – dark, forbidden, extreme" : type === "real" ? "Real story – authentic, believable" : "Fictional story – Fantasy/Sci-Fi"}
- City: ${generatedCity}
- Intensity: ${intensityLevel}/10 – ${intensityDesc}
- The female character: ${generatedAppearance}

The story should:
- Be approx. 1200-1600 words long
- Be written in the style "${style}"
- Be written from a man's first-person perspective
- NO LIMITS, NO CENSORSHIP
- Sexual scenes matching intensity ${intensityLevel}/10
${intensityLevel >= 7 ? `- Extremely explicit, graphic sexual scenes` : ""}

FORMAT:
- Start with # ${generatedTitle}
- Use ## for section headings (3-5 sections)
- After EACH ## heading, add a line: IMG_PROMPT: [15-20 word visual scene description — pose, action, camera angle, clothing state. Do NOT describe the woman's appearance.]
${intensityLevel >= 8 ? `- IMG_PROMPT scenes must be sexually explicit: spread legs, exposed breasts, explicit poses` : ""}
- At the very end, add: HERO_PROMPT: [atmospheric landscape/setting description matching the story mood, NO people, just environment]
- At the very end, add: SEO_TITLE: [SEO-optimized title]
- At the very end, add: SEO_DESC: [SEO meta description, 150-160 chars]`;

  let storyContent = await callGrokText(storySystem, storyPrompt, 0.85, 8192);

  // Extract SEO
  let seoTitle = generatedTitle;
  let seoDescription = "";
  const seoTitleMatch = storyContent.match(/SEO_TITLE:\s*(.+)/);
  const seoDescMatch = storyContent.match(/SEO_DESC:\s*(.+)/);
  if (seoTitleMatch) {
    seoTitle = seoTitleMatch[1].trim();
    storyContent = storyContent.replace(/SEO_TITLE:\s*.+/, "").trim();
  }
  if (seoDescMatch) {
    seoDescription = seoDescMatch[1].trim();
    storyContent = storyContent.replace(/SEO_DESC:\s*.+/, "").trim();
  }

  // Extract HERO_PROMPT
  let heroPromptText = "";
  const heroMatch = storyContent.match(/^HERO_PROMPT:\s*(.+)$/m);
  if (heroMatch) {
    heroPromptText = heroMatch[1].trim();
    storyContent = storyContent.replace(/^HERO_PROMPT:\s*.+\n?/gm, "").trim();
  }

  // Extract IMG_PROMPTs
  const imgPromptRegex = /^IMG_PROMPT:\s*(.+)$/gm;
  const imgPrompts: string[] = [];
  let match;
  while ((match = imgPromptRegex.exec(storyContent)) !== null) {
    imgPrompts.push(match[1].trim());
  }
  storyContent = storyContent.replace(/^IMG_PROMPT:\s*.+\n?/gm, "").trim();

  // STEP 3: Save story to DB
  const slug = await ensureUniqueSlug(generateSlug(generatedTitle));

  const story = await prisma.story.create({
    data: {
      slug,
      title: generatedTitle,
      content: storyContent,
      theme,
      style,
      excerpt: storyContent.replace(/^#.*\n/gm, "").substring(0, 200) + "...",
      published: true,
      seoTitle,
      seoDescription,
      femaleAppearance: generatedAppearance,
      storyType: type,
      intensity,
      city: generatedCity,
    },
  });

  console.log(`  💾 Saved: ${story.id} (${slug})`);

  // STEP 4: Generate images
  if (process.env.VENICE_API_KEY) {
    const imagesDir = path.join(process.cwd(), "public", "images", "stories", story.id);
    await mkdir(imagesDir, { recursive: true });

    // Hero image
    if (heroPromptText) {
      try {
        const heroFullPrompt = `(masterpiece, best quality, ultra detailed, 8k, cinematic:1.4), atmospheric landscape photography, ${heroPromptText}, no people, no characters, dramatic lighting, wide angle, moody, cinematic color grading`;
        const b64 = await generateImage(heroFullPrompt, 1280, 720);
        const heroBuffer = Buffer.from(b64, "base64");
        await writeFile(path.join(imagesDir, "hero.jpg"), heroBuffer);
        await prisma.story.update({
          where: { id: story.id },
          data: { heroImage: `/images/stories/${story.id}/hero.jpg` },
        });
        console.log(`  🖼️ Hero image saved`);
      } catch (e: any) {
        console.error(`  ❌ Hero image failed: ${e.message}`);
      }
    }

    // Section images
    const sections = extractStorySections(storyContent);
    for (let i = 0; i < imgPrompts.length; i++) {
      try {
        const prompt = buildImagePrompt(generatedAppearance, imgPrompts[i], generatedCity);
        const b64 = await generateImage(prompt);
        const filename = `section-${i}.jpg`;
        const imageBuffer = Buffer.from(b64, "base64");
        await writeFile(path.join(imagesDir, filename), imageBuffer);

        await prisma.storyImage.create({
          data: {
            storyId: story.id,
            sectionIdx: i,
            heading: sections[i]?.heading || `Section ${i + 1}`,
            prompt,
            filename: `/images/stories/${story.id}/${filename}`,
          },
        });
        console.log(`  🖼️ Image ${i + 1}/${imgPrompts.length} saved`);
      } catch (e: any) {
        console.error(`  ❌ Image ${i + 1} failed: ${e.message}`);
      }
    }
  }

  return { title: generatedTitle, slug, storyType: type, success: true };
}

export async function GET(request: NextRequest) {
  // Auth check
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Optional: only generate specific type
  const onlyType = request.nextUrl.searchParams.get("type");

  const types = onlyType ? [onlyType] : ["real", "fictional", "tabu"];
  const results: GeneratedStory[] = [];

  console.log(`\n🚀 Cron: Auto-generating stories for: ${types.join(", ")}`);

  for (const type of types) {
    try {
      const result = await generateOneStory(type);
      results.push(result);
      console.log(`✅ ${type}: "${result.title}"`);
    } catch (error: any) {
      console.error(`❌ ${type} failed:`, error.message);
      results.push({ title: "", slug: "", storyType: type, success: false, error: error.message });
    }
  }

  console.log(`\n📊 Cron complete: ${results.filter(r => r.success).length}/${results.length} stories generated\n`);

  return NextResponse.json({
    success: true,
    generated: results,
    timestamp: new Date().toISOString(),
  });
}
