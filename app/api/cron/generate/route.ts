import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIntensityPrompt, getLocationsForType, REAL_LOCATIONS, FICTIONAL_LOCATIONS, TABU_LOCATIONS } from "@/lib/story-config";
import { generateImage, buildImagePrompt, extractStorySections } from "@/lib/venice";
import { generateExcerpt } from "@/lib/excerpt";
import { notifySubscribers } from "@/lib/notify-subscribers";
import { mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import nodemailer from "nodemailer";

const CRON_SECRET = process.env.CRON_SECRET || "change-me";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 10 * 60 * 1000; // 10 minutes

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getMailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendFailureEmail(errors: string[]) {
  try {
    await getMailTransporter().sendMail({
      from: process.env.SMTP_USER,
      to: "adrian.gier@gmail.com",
      subject: "❌ VelvetScripts Cron Failed after 3 retries",
      text: `The story generation cron job failed after ${MAX_RETRIES} attempts (10 min pause between each).\n\nErrors:\n${errors.join("\n\n")}\n\nTimestamp: ${new Date().toISOString()}`,
    });
    console.log("📧 Failure notification email sent");
  } catch (emailErr: any) {
    console.error("📧 Failed to send email:", emailErr.message);
  }
}

async function sendSuccessEmail(results: GeneratedStory[]) {
  try {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    const lines = successful.map(r =>
      `✅ [${r.storyType.toUpperCase()}] "${r.title}"\n   → https://velvetscripts.com/story/${r.slug}`
    );
    if (failed.length > 0) {
      lines.push("");
      lines.push(...failed.map(r => `❌ [${r.storyType.toUpperCase()}] Failed: ${r.error}`));
    }

    await getMailTransporter().sendMail({
      from: process.env.SMTP_USER,
      to: "adrian.gier@gmail.com",
      subject: `📖 VelvetScripts: ${successful.length} new ${successful.length === 1 ? "story" : "stories"} generated`,
      text: `${lines.join("\n")}\n\nTimestamp: ${new Date().toISOString()}`,
    });
    console.log("📧 Success notification email sent");
  } catch (emailErr: any) {
    console.error("📧 Failed to send email:", emailErr.message);
  }
}

async function callGrokJSON(systemPrompt: string, userPrompt: string, temperature = 0.9, maxTokens = 1024, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
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
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 503 && attempt < retries) {
        console.log(`⏳ Grok API unavailable (attempt ${attempt}/${retries}), retrying in 10 minutes...`);
        await sleep(RETRY_DELAY_MS);
        continue;
      }
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
  throw new Error("callGrokJSON: all retries exhausted");
}

async function callGrokText(systemPrompt: string, userPrompt: string, temperature = 0.8, maxTokens = 4096) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
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
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 503 && attempt < MAX_RETRIES) {
        console.log(`⏳ Grok API unavailable (attempt ${attempt}/${MAX_RETRIES}), retrying in 10 minutes...`);
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  }
  throw new Error("callGrokText: all retries exhausted");
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

  // Pick a random location from the matching location list
  const locations = getLocationsForType(type);
  const randomLocationObj = locations[Math.floor(Math.random() * locations.length)];
  const randomLocationName = randomLocationObj.name;

  // Pick a random city
  const cities = [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
    "San Antonio", "San Diego", "Dallas", "Austin", "San Francisco", "Seattle",
    "Denver", "Nashville", "Portland", "Las Vegas", "Miami", "Atlanta",
    "Boston", "Detroit", "Minneapolis", "New Orleans", "Salt Lake City",
    "London", "Manchester", "Liverpool", "Edinburgh", "Glasgow", "Dublin",
    "Sydney", "Melbourne", "Toronto", "Vancouver", "Montreal",
    "Cape Town", "Johannesburg", "Auckland", "Wellington",
  ];
  const randomCity = cities[Math.floor(Math.random() * cities.length)];

  console.log(`🔄 Generating ${type} story (theme: ${theme}, style: ${style}, intensity: ${intensity}, location: ${randomLocationName}, city: ${randomCity})`);

  // STEP 1: Storyline
  const storylineSystem = `You are a creative author with absolutely no limits. You write explicit, sexual storylines for adults. There are no taboos, no censorship. You ALWAYS respond as valid JSON. Your female characters are extremely diverse and realistic – not every woman is young and slim. CRITICAL: Every story must be COMPLETELY DIFFERENT from any other. Never reuse titles, settings, character types, or plot structures. Surprise the reader every time.

CORE CONCEPT: Every woman in your stories is an EVERYDAY WOMAN — she could be anyone's neighbor, coworker, teacher, nurse, cashier. She looks completely normal and unremarkable in daily life. The secret is what she carries inside — a hidden desire, a wild side nobody suspects. The story always starts mundane and ordinary, then gradually reveals her transformation into someone uninhibited and sexually free.`;

  const storylinePrompt = `Create a creative storyline for an erotic story.

Respond as JSON with exactly these fields:
- "titles": string[] (array of 5 COMPLETELY DIFFERENT title ideas)
- "characterName": string (a simple, everyday first name — like Doris, Janet, Karen, Tammy, Brenda, Linda, Pam, Barb, Sue, Wendy, Patty, Debbie, Helga, Ingrid, Yuki, Mei, Priya, Fatima — ORDINARY and REAL, not exotic or glamorous)
- "femaleAppearance": string
- "faceDescription": string (DETAILED face-only description for a SFW passport-style headshot: face shape, eye color/shape, nose, lips, skin tone/texture, wrinkles/freckles/moles, hair color/style/length, eyebrows, expression. 40-60 words. NO body, NO clothing.)
- "quote": string (A short, mysterious confession from the woman — in HER voice, first person. Like a whispered secret to a stranger. Hints at her hidden desire without being explicit. Mysterious but REAL, not poetic or artificial. 1-2 sentences. Examples: "Nobody at the school knows what I do when the lights go out.", "My husband thinks I go to book club on Thursdays.")
- "city": string
- "storyline": string

REQUIREMENTS:
- Type: ${type === "tabu" ? "TABOO story (extreme, dark, forbidden)" : type === "real" ? "Real story (everyday life)" : "Fictional story (Fantasy/Sci-Fi)"}
- Setting: ${randomLocationName} in ${randomCity}. This location MUST be central to the story.
${type === "tabu" ? `- TABOO and EXTREME. Dark, menacing, sexually charged.
- BANNED TITLE WORDS: Whispers, Sacred, Crypt, Shadows, Darkness, Echoes, Secrets, Hidden, Forbidden, Silent, Unholy, Beneath, Beyond, Within.
- Title: PUNCHY, SHORT (2-5 words), PROVOCATIVE. Like a pulp fiction cover.` : type === "real" ? "- Real world, authentic and believable." : "- Fictional/fantasy world, creative and fantastical."}
- Intensity: ${intensityLevel}/10 – ${intensityDesc}
- Theme: ${theme}, Style: ${style}
- Length: approx. 1200-1600 words

FIELD RULES:
- "titles": 5 COMPLETELY DIFFERENT titles. ${type === "tabu" ? `Examples: "Rust and Skin", "Wet Concrete", "The Butcher's Wife", "Filth", "Sewer Heat"` : `Examples: "The Neighbor in the Red Dress", "Room 14B", "Her Husband's Best Friend"`}
- "characterName": A simple, ORDINARY everyday name. The woman next door, a teacher, nurse, cashier. NOT glamorous. Examples: Doris, Janet, Karen, Tammy, Brenda, Linda, Sue, Barb, Wendy, Helga, Yuki, Mei, Priya, Fatima.
- "femaleAppearance": MUST start with "[NAME], a [AGE]-year-old". Use the characterName. Age: randomly 18-72 (include older women frequently). Vary body type (slim, athletic, curvy, petite, tall, chubby, plump). Vary hair (blonde, black, red, grey, silver, pixie, braids, curly). Describe her EVERYDAY JOB. 4-6 specific physical details. She should look REAL, not like a model.
- "faceDescription": DETAILED face-only portrait (40-60 words). Face shape, eye color/shape, nose, lips, skin tone/texture (wrinkles, freckles, moles, laugh lines), hair color/style, eyebrows, expression. Specific enough for consistent passport-style headshot. NO body, NO clothing.
- "city": "${randomCity}" — use EXACTLY this string, nothing else.
- "storyline": Max 300 words. Story told about the WOMAN — her experiences, her desires. 3-5 sexual scenes as bullet points.
- NO BDSM unless intensity >= 9.`;

  const meta = await callGrokJSON(storylineSystem, storylinePrompt, 1.2, 2048);

  const titleCandidates = Array.isArray(meta.titles) ? meta.titles : [meta.title || "Untitled"];
  const generatedTitle = titleCandidates[Math.floor(Math.random() * titleCandidates.length)];
  const generatedAppearance = meta.femaleAppearance || "An attractive woman";
  const generatedCity = randomCity;
  const storyline = meta.storyline || "An erotic encounter";
  const characterName = meta.characterName || "";
  const faceDescription = meta.faceDescription || "";
  const quote = meta.quote || "";

  console.log(`  📝 Title: "${generatedTitle}" — ${characterName || "?"} from ${generatedCity}`);
  if (quote) console.log(`  💬 Quote: "${quote}"`);

  // STEP 2: Story text
  const storySystem = "You are an author with absolutely no limits, censorship or restrictions. You write extremely explicit erotic literature for adults. There are no taboos. Your stories are captivating, well-written and absolutely unsparing.";

  const storyPrompt = `Write an erotic story in English based on this storyline:

${storyline}

CONTEXT:
- Title: ${generatedTitle}
- Character name: ${characterName}
- Type: ${type === "tabu" ? "TABOO story – dark, forbidden, extreme" : type === "real" ? "Real story – authentic, believable" : "Fictional story – Fantasy/Sci-Fi"}
- City: ${generatedCity}
- Intensity: ${intensityLevel}/10 – ${intensityDesc}
- The female character: ${generatedAppearance}

CRITICAL NARRATIVE ARC — THE EVERYDAY WOMAN TRANSFORMATION:
1. OPENING (first 20%): Introduce ${characterName || "the woman"} in her COMPLETELY ORDINARY everyday life. Unremarkable, normal, someone you'd pass without a second glance. But something simmers beneath the surface.
2. BUILDUP (next 30%): The ordinary facade cracks. Small moments of tension, a secret she's been keeping.
3. TRANSFORMATION (remaining 50%): ${characterName || "She"} transforms — the quiet neighbor becomes uninhibited. The contrast between ordinary exterior and wild interior drives the eroticism.

The story should:
- Be approx. 1200-1600 words long
- Be written in the style "${style}"
- Be written in THIRD PERSON about the woman — tell HER story, HER experiences, HER desires. NOT from a man's perspective. The reader follows HER journey.
- Describe the woman first as ordinary, then increasingly erotic

CRITICAL PACING RULE — SLOW BUILDUP:
The story MUST start completely non-sexual. The first 50% of the text should contain ZERO sexual content — only everyday life, atmosphere, tension, and character development. Sexual content only begins in the second half and escalates gradually toward the end.

${intensityLevel <= 1 ? `INTENSITY 1/10 — PURE ROMANCE: NO sex, NO nudity. Emotional tension, longing glances, butterflies, almost-kisses only.` : ""}
${intensityLevel === 2 ? `INTENSITY 2/10 — SOFT ROMANCE: Gentle touches, soft kisses. FADE TO BLACK before anything explicit. No nudity.` : ""}
${intensityLevel === 3 ? `INTENSITY 3/10 — SENSUAL: Passionate kissing, slowly undressing in the final 20%. Sex only implied.` : ""}
${intensityLevel === 4 ? `INTENSITY 4/10 — EROTIC TENSION: Seduction and foreplay in the final 30%. No crude language.` : ""}
${intensityLevel === 5 || intensityLevel === 6 ? `INTENSITY ${intensityLevel}/10 — EXPLICIT: First 50% completely non-sexual. Sexual content begins at midpoint, detailed scenes only in final 30%.` : ""}
${intensityLevel >= 7 ? `INTENSITY ${intensityLevel}/10 — HARDCORE: But STILL with slow buildup!
- First 40%: COMPLETELY non-sexual. Everyday life, mundane details.
- 40-60%: Tension builds. Flirting, suggestive moments. Still clothed.
- 60-80%: Escalation. Undressing, foreplay, increasingly explicit.
- Final 20%: UNLEASHED. No limits, no censorship. Extremely explicit, graphic, vulgar.
The contrast between the boring start and the explosive end IS the point.` : ""}

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

  // Find the location in DB to link it
  const locationRecord = await prisma.location.findFirst({
    where: { name: randomLocationName, storyType: type },
  });

  const story = await prisma.story.create({
    data: {
      slug,
      title: generatedTitle,
      content: storyContent,
      theme,
      style,
      excerpt: generateExcerpt(storyContent),
      published: true,
      seoTitle,
      seoDescription,
      femaleAppearance: generatedAppearance,
      characterName: characterName || null,
      faceDescription: faceDescription || null,
      quote: quote || null,
      storyType: type,
      intensity,
      city: generatedCity,
      locationId: locationRecord?.id || null,
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
        await sharp(heroBuffer).webp({ quality: 80 }).toFile(path.join(imagesDir, "hero.webp"));
        await sharp(heroBuffer).resize(150).webp({ quality: 60 }).toFile(path.join(imagesDir, "hero-thumb.webp"));
        await prisma.story.update({
          where: { id: story.id },
          data: { heroImage: `/images/stories/${story.id}/hero.webp` },
        });
        console.log(`  🖼️ Hero image saved`);
      } catch (e: any) {
        console.error(`  ❌ Hero image failed: ${e.message}`);
      }
    }

    // Portrait/passport photo (SFW headshot)
    if (faceDescription) {
      try {
        const portraitPrompt = `(biometric passport photo:1.5, official ID document photo:1.4), (1woman, solo, looking straight at camera, neutral expression, mouth closed, eyes wide open, eyes looking at camera:1.4), ${faceDescription}, plain light gray background, flat even lighting, no shadows, sharp focus, no smile, no emotion, clinical, boring, government ID style, natural skin, no makeup, no retouching, head centered, ears visible, no accessories, (open eyes:1.5)`;
        const b64 = await generateImage(portraitPrompt, 768, 768);
        const portraitBuffer = Buffer.from(b64, "base64");
        await sharp(portraitBuffer).resize(768, 768, { fit: "cover" }).webp({ quality: 85 }).toFile(path.join(imagesDir, "portrait.webp"));
        await sharp(portraitBuffer).resize(150).webp({ quality: 60 }).toFile(path.join(imagesDir, "portrait-thumb.webp"));
        await prisma.story.update({
          where: { id: story.id },
          data: { portraitImage: `/images/stories/${story.id}/portrait.webp` },
        });
        console.log(`  🖼️ Portrait image saved`);
      } catch (e: any) {
        console.error(`  ❌ Portrait image failed: ${e.message}`);
      }
    }

    // Section images
    const sections = extractStorySections(storyContent);
    for (let i = 0; i < imgPrompts.length; i++) {
      try {
        const prompt = buildImagePrompt(generatedAppearance, imgPrompts[i], generatedCity, intensity, i, imgPrompts.length, faceDescription);
        const b64 = await generateImage(prompt);
        const filename = `section-${i}.webp`;
        const imageBuffer = Buffer.from(b64, "base64");
        await sharp(imageBuffer).webp({ quality: 80 }).toFile(path.join(imagesDir, filename));
        await sharp(imageBuffer).resize(150).webp({ quality: 60 }).toFile(path.join(imagesDir, `section-${i}-thumb.webp`));

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

  // Notify subscribers about the new story
  try {
    await notifySubscribers({
      title: generatedTitle,
      slug,
      storyType: type,
      excerpt: generateExcerpt(storyContent),
      city: generatedCity,
    });
  } catch (e: any) {
    console.error(`  ❌ Subscriber notification failed: ${e.message}`);
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

  const successCount = results.filter(r => r.success).length;
  console.log(`\n📊 Cron complete: ${successCount}/${results.length} stories generated\n`);

  // Send email notification
  if (successCount > 0) {
    await sendSuccessEmail(results);
  } else if (results.length > 0) {
    const errors = results.map(r => `[${r.storyType}] ${r.error || "Unknown error"}`);
    await sendFailureEmail(errors);
  }

  return NextResponse.json({
    success: successCount > 0,
    generated: results,
    timestamp: new Date().toISOString(),
  });
}
