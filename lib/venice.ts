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
      negative_prompt: "deformed, ugly, bad anatomy, disfigured, multiple women, group, threesome, crowd, extra people, extra limbs, cartoon, anime, illustration, painting, 3d render, supermodel, fashion model, glamour model, professional model, perfect skin, heavy makeup, plastic surgery, fake lips, fake breasts, silicone, botox, studio lighting, professional photography, airbrushed",
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
  intensity: number = 5,
  sectionIndex: number = 0,
  totalSections: number = 5,
): string {
  const parts: string[] = [];

  // Girl-next-door amateur style — real, everyday woman, not a model
  parts.push("(photorealistic:1.4, amateur photography, candid shot, raw photo, natural imperfections, grainy, shot on phone, authentic, unposed, girl next door, ordinary girl, everyday woman, natural beauty, no makeup, imperfect skin, realistic body:1.3)");

  // Enforce single woman — neighbor / amateur vibe
  parts.push("(1woman, solo female focus, average body, natural look, approachable, cute neighbor girl:1.4)");

  // Character appearance FIRST and EMPHASIZED for consistency
  if (femaleAppearance) {
    parts.push(`(${femaleAppearance}:1.5)`);
  }

  // Scene action/pose (should NOT re-describe the woman)
  if (sceneDescription) {
    parts.push(sceneDescription);
  }

  // Progressive escalation: image 1 = clothed/teasing → last image = hardcore
  // Calculate escalation level 0-4 based on position in story
  const escalation = totalSections <= 1 ? 4 : Math.round((sectionIndex / (totalSections - 1)) * 4);

  const level0Poses = [
    "leaning in doorway fully clothed",
    "sitting on windowsill in casual outfit",
    "standing with hand on hip wearing dress",
    "walking away looking over shoulder in tight jeans",
    "perched on counter legs crossed in skirt",
  ];
  const level1Poses = [
    "unbuttoning blouse showing cleavage",
    "pulling dress strap off shoulder",
    "lying on bed in lingerie",
    "standing in bra and panties",
    "sitting cross-legged in underwear",
  ];
  const level2Poses = [
    "topless covering breasts with hands",
    "lying on stomach looking back in thong",
    "standing with arms above head topless",
    "kneeling upright hands on thighs in panties only",
    "reclining on couch in open robe",
  ];
  const level3Poses = [
    "fully nude lying on side",
    "naked sitting on edge of bed",
    "nude standing with arched back",
    "naked kneeling upright sensual pose",
    "nude reclining with legs slightly parted",
  ];
  const level4Poses = [
    "lying on back with legs spread wide",
    "on all fours looking back over shoulder",
    "sitting with legs open leaning back",
    "squatting down spreading legs",
    "kneeling with arched back legs apart",
  ];

  const poseSets = [level0Poses, level1Poses, level2Poses, level3Poses, level4Poses];
  const explicitness = [
    "(sexy woman, fully clothed, teasing, flirty, suggestive:1.3)",
    "(sexy woman, lingerie, underwear, seductive, showing skin:1.3)",
    "(topless woman, partially nude, exposed breasts, erotic, sensual:1.3)",
    "(fully nude woman, naked, exposed body, erotic, sensual touching:1.4)",
    "(fully nude woman, exposed pussy, spread legs, touching herself, masturbating, moaning, orgasm face, pornographic, explicit:1.5)",
  ];

  // Clamp escalation to story's max intensity
  const maxLevel = intensity >= 8 ? 4 : intensity >= 6 ? 3 : intensity >= 4 ? 2 : 1;
  const level = Math.min(escalation, maxLevel);

  const poses = poseSets[level];
  const pose = poses[Math.floor(Math.random() * poses.length)];
  parts.push(`(${pose}:1.3), ${explicitness[level]}`);

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
  const text = sectionContent.replace(/\n+/g, " ").replace(/\*+/g, "").trim();

  // Take first 3 sentences to capture scene + surroundings
  const sentences = text.split(/(?<=[.!?])\s+/).slice(0, 3);
  const combined = sentences.join(" ");

  // Cap at 300 chars — enough for scene context without overwhelming the model
  const short = combined.length > 300 ? combined.substring(0, 300) : combined;
  return short;
}
