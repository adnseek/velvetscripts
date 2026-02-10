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
export async function generateImage(prompt: string, width = 1024, height = 1024): Promise<string> {
  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) {
    throw new Error("VENICE_API_KEY is not configured");
  }

  const response = await fetch(VENICE_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "lustify-v7",
      prompt,
      width,
      height,
      safe_mode: false,
      hide_watermark: true,
      negative_prompt: "blurry, low quality, pixelated, out of focus, deformed, ugly, bad anatomy, disfigured, fat, obese, overweight, chubby, old, elderly, wrinkles, aged, mature, saggy, double chin, multiple women, multiple men, group, threesome, crowd, extra people, extra limbs, solo",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Venice API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data: VeniceImageResponse = await response.json();

  if (!data.images?.[0]) {
    throw new Error("No image data returned from Venice API");
  }

  return data.images[0];
}

/**
 * Build a consistent image prompt for a story scene.
 * Always includes the full character description to maintain visual consistency.
 */
export function buildImagePrompt(
  femaleAppearance: string,
  sceneDescription: string,
  locationContext?: string,
): string {
  const parts: string[] = [];

  // Strong quality tags
  parts.push("(masterpiece, best quality, ultra detailed, sharp focus, 8k, photorealistic:1.4), cinematic lighting, professional photography");

  // Enforce exactly 1 man + 1 woman
  parts.push("(1man, 1woman, couple, two people only:1.4)");

  // Character appearance FIRST and EMPHASIZED for consistency
  if (femaleAppearance) {
    parts.push(`(${femaleAppearance}:1.5)`);
  }

  // Muscular/fit man
  parts.push("(athletic muscular man:1.2)");

  // Scene action/pose (should NOT re-describe the woman)
  if (sceneDescription) {
    parts.push(sceneDescription);
  }

  // Sexual interaction emphasis
  parts.push("(intimate sexual encounter, passionate, erotic:1.3)");

  // Location/setting context
  if (locationContext) {
    parts.push(locationContext);
  }

  // Reinforce key appearance traits at the end
  if (femaleAppearance) {
    const hairMatch = femaleAppearance.match(/(\w[\w\s-]*hair[\w\s-]*)/i);
    const skinMatch = femaleAppearance.match(/(\w[\w\s-]*skin[\w\s-]*)/i);
    const extras: string[] = [];
    if (hairMatch) extras.push(hairMatch[1].trim());
    if (skinMatch) extras.push(skinMatch[1].trim());
    if (extras.length > 0) {
      parts.push(`(same woman, consistent appearance, ${extras.join(", ")}:1.2)`);
    }
  }

  return parts.join(", ");
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
  // Strip to visual/action keywords only — narrative text confuses image models
  const text = sectionContent.replace(/\n+/g, " ").trim();

  // Take just the first sentence for the core visual
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0] || text;

  // Keep it very short — max 150 chars for SDXL
  const short = firstSentence.length > 150 ? firstSentence.substring(0, 150) : firstSentence;
  return short;
}
