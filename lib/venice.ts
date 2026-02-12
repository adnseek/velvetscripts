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
        negative_prompt: "deformed, ugly, bad anatomy, disfigured, multiple women, group, threesome, crowd, extra people, extra limbs, cartoon, anime, illustration, painting, 3d render, supermodel, fashion model, glamour model, professional model, perfect skin, heavy makeup, plastic surgery, fake lips, fake breasts, silicone, botox, studio lighting, professional photography, airbrushed",
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

  // Core style (kept short)
  parts.push("(photorealistic:1.4, candid, raw photo, amateur, girl next door:1.3)");
  parts.push("(1woman, solo:1.4)");

  // Face description for consistency (prioritize over full appearance)
  if (faceDescription) {
    parts.push(`(${faceDescription}:1.5)`);
  }

  // Extract only key appearance traits (hair, skin, body) — not the full paragraph
  if (femaleAppearance) {
    const short = femaleAppearance
      .replace(/^Her name is \w+,?\s*/i, "")
      .replace(/^[\w]+,?\s*a\s*\d+-year-old\s*/i, "")
      .substring(0, 200);
    parts.push(`(${short}:1.3)`);
  }

  // Scene
  if (sceneDescription) {
    parts.push(sceneDescription);
  }

  // Progressive escalation
  const escalation = totalSections <= 1 ? 4 : Math.round((sectionIndex / (totalSections - 1)) * 4);
  const maxLevel = intensity >= 8 ? 4 : intensity >= 6 ? 3 : intensity >= 4 ? 2 : 1;
  const level = Math.min(escalation, maxLevel);

  const poses = [
    ["clothed, teasing, flirty"],
    ["lingerie, seductive, showing skin"],
    ["topless, exposed breasts, sensual"],
    ["fully nude, naked, erotic"],
    ["nude, spread legs, explicit, pornographic"],
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
 * Summarize a story section into a concise visual scene description
 * suitable for an image generation prompt (max ~100 words).
 */
export function summarizeForImagePrompt(sectionContent: string): string {
  const text = sectionContent.replace(/\n+/g, " ").replace(/\*+/g, "").trim();

  // Take first 3 sentences to capture scene + surroundings
  const sentences = text.split(/(?<=[.!?])\s+/).slice(0, 3);
  const combined = sentences.join(" ");

  // Cap at 300 chars — enough for scene context without overwhelming the model
  const short = combined.length > 300 ? combined.substring(0, 300) : combined;
  return short;
}
