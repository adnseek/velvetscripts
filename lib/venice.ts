/**
 * Venice.ai API client for adult image generation.
 * Uses the lustify-v7 model to generate images from text prompts.
 */

const VENICE_API_URL = "https://api.venice.ai/api/v1/image/generate";

export interface VeniceImageRequest {
  prompt: string;
  model?: string;
  size?: string;
  response_format?: "b64_json" | "url";
}

export interface VeniceImageResponse {
  id: string;
  images: string[];
}

/**
 * Generate an image using Venice.ai API.
 * Returns base64-encoded image data.
 */
export async function generateImage(prompt: string, width = 1024, height = 1024, maxRetries = 2): Promise<string> {
  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) {
    throw new Error("VENICE_API_KEY is not configured");
  }

  let lastError = "";
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) console.log(`[venice] Retry ${attempt}/${maxRetries}...`);

    const response = await fetch(VENICE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "lustify-v7",
        prompt: prompt.length > 1490 ? prompt.substring(0, 1490) : prompt,
        width,
        height,
        safe_mode: false,
        hide_watermark: true,
        negative_prompt: `deformed, ugly, bad anatomy, disfigured, multiple women, group, threesome, crowd, extra people, extra limbs, cartoon, anime, illustration, painting, 3d render, supermodel, fashion model, glamour model, professional model, perfect skin, heavy makeup, plastic surgery, fake lips, fake breasts, silicone, botox, studio lighting, professional photography, airbrushed, closed eyes, squinting, sleeping, eyes closed, shut eyes, half closed eyes, smiling, grinning, laughing, happy expression, toothy smile${prompt.includes("-year-old") && parseInt(prompt.match(/(\d+)-year-old/)?.[1] || "30") >= 45 ? ", young, teenager, 20 year old, youthful, baby face, smooth skin" : ""}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      lastError = `Venice API error: ${response.status} - ${JSON.stringify(errorData)}`;
      continue;
    }

    const data: VeniceImageResponse = await response.json();

    if (data.images?.[0] && data.images[0].length > 100) {
      return data.images[0];
    }

    lastError = "No image data returned from Venice API";
  }

  throw new Error(lastError);
}

/**
 * Build a consistent image prompt for a story scene.
 * Always includes the full character description to maintain visual consistency.
 */
export function buildImagePrompt(
  femaleAppearance: string,
  sceneDescription: string,
  locationContext?: string,
  intensity: number = 5,
  sectionIndex: number = 0,
  totalSections: number = 5,
  faceDescription?: string,
): string {
  const parts: string[] = [];

  // Extract age first to adjust style tags
  const ageMatch = femaleAppearance?.match(/(\d+)-year-old/);
  const age = ageMatch ? parseInt(ageMatch[1]) : 30;

  // Core style (adjusted for age)
  if (age >= 45) {
    parts.push("(photorealistic:1.4, candid, raw photo, amateur, ordinary woman:1.3)");
  } else {
    parts.push("(photorealistic:1.4, candid, raw photo, amateur, girl next door:1.3)");
  }
  parts.push("(1woman, solo:1.4)");

  // Face description for consistency (prioritize over full appearance)
  if (faceDescription) {
    parts.push(`(${faceDescription}:1.5)`);
  }

  // Age and appearance traits
  if (femaleAppearance) {
    parts.push(`(${age}-year-old woman:1.5)`);
    if (age >= 50) parts.push("(mature, older woman, aged, wrinkles, aging skin, sagging:1.4)");
    else if (age >= 40) parts.push("(mature woman, middle-aged, laugh lines:1.3)");
    // Keep body/hair/skin traits but remove name prefix
    const short = femaleAppearance
      .replace(/^Her name is \w+,?\s*/i, "")
      .replace(/^[\w]+,?\s*/i, "")
      .substring(0, 200);
    parts.push(`(${short}:1.3)`);
  }

  // Scene
  if (sceneDescription) {
    parts.push(sceneDescription);
  }

  // Progressive escalation — SLOW curve: first images stay clothed, only last ones get explicit
  // Power curve (x^2) so escalation is back-loaded
  const progress = totalSections <= 1 ? 1.0 : sectionIndex / (totalSections - 1);
  const escalation = Math.floor(Math.pow(progress, 2.0) * 5);
  const maxLevel = intensity >= 9 ? 5 : intensity >= 7 ? 4 : intensity >= 5 ? 3 : intensity >= 3 ? 2 : 1;
  const level = Math.min(escalation, maxLevel);

  const poses = [
    ["clothed, teasing, flirty, casual"],
    ["tight clothing, cleavage, showing skin, seductive"],
    ["lingerie, underwear, partially undressed, sensual"],
    ["topless, exposed breasts, nude, erotic pose"],
    ["fully nude, spread legs, explicit, pussy visible, pornographic"],
    ["hardcore, spread pussy, penetration, fucking, legs spread wide, explicit sex, cum, pornographic, XXX"],
  ];
  parts.push(`(${poses[level][0]}:1.3)`);

  if (locationContext) {
    parts.push(locationContext);
  }

  // Hard limit: Venice lustify models cap at 1500 chars
  const result = parts.join(", ");
  return result.length > 1490 ? result.substring(0, 1490) : result;
}

/**
 * Extract scene descriptions from story sections (split by H2 headings).
 * Returns an array of { heading, content } for each section.
 */
export function extractStorySections(storyContent: string): Array<{ heading: string; content: string }> {
  const sections: Array<{ heading: string; content: string }> = [];

  // Split by ## headings
  const parts = storyContent.split(/^## /m);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Skip the title (# heading) section — take only ## sections
    if (trimmed.startsWith("# ")) continue;

    const newlineIdx = trimmed.indexOf("\n");
    if (newlineIdx === -1) continue;

    const heading = trimmed.substring(0, newlineIdx).trim();
    const content = trimmed.substring(newlineIdx + 1).trim();

    if (heading && content) {
      sections.push({ heading, content });
    }
  }

  return sections;
}

/**
 * Quick fallback: extract first 3 sentences (used if Grok call fails).
 */
export function summarizeForImagePrompt(sectionContent: string): string {
  const text = sectionContent.replace(/\n+/g, " ").replace(/\*+/g, "").trim();
  const sentences = text.split(/(?<=[.!?])\s+/).slice(0, 3);
  const combined = sentences.join(" ");
  return combined.length > 300 ? combined.substring(0, 300) : combined;
}

/**
 * Use Grok to summarize a story section into a visual scene description
 * for image generation. Returns a concise description of WHAT IS VISIBLE
 * in the scene (location, pose, clothing, action) — not emotions or dialogue.
 */
export async function summarizeSceneWithGrok(sectionContent: string, heading: string): Promise<string> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) return summarizeForImagePrompt(sectionContent);

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [
          {
            role: "system",
            content: `You describe scenes for image generation. Output ONLY a short visual description (max 60 words). Describe ONLY what a camera would see: location, setting, woman's pose, clothing state, body position, lighting, surroundings. NO emotions, NO dialogue, NO names, NO story context. Be specific and concrete. Example: "woman sitting on park bench under oak tree at dusk, wearing unbuttoned blouse, skirt hiked up, legs parted, looking over shoulder, golden hour lighting"`,
          },
          {
            role: "user",
            content: `Section: "${heading}"\n\n${sectionContent.substring(0, 1500)}\n\nDescribe ONLY what is visually happening in this scene for an image generator. Max 60 words.`,
          },
        ],
        temperature: 0.5,
        max_tokens: 150,
      }),
    });

    if (!response.ok) return summarizeForImagePrompt(sectionContent);

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim();
    if (!description || description.length < 10) return summarizeForImagePrompt(sectionContent);

    // Cap at 300 chars
    return description.length > 300 ? description.substring(0, 300) : description;
  } catch {
    return summarizeForImagePrompt(sectionContent);
  }
}
