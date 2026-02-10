/**
 * Generate a clean excerpt from story content.
 * Strips markdown headings, IMG_PROMPT lines, and other non-prose content.
 */
export function generateExcerpt(content: string, maxLength = 200): string {
  const cleaned = content
    .replace(/^#{1,6}\s+.*$/gm, "")   // Remove all markdown headings
    .replace(/^IMG_PROMPT:.*$/gm, "")  // Remove IMG_PROMPT lines
    .replace(/\n{2,}/g, " ")           // Collapse multiple newlines
    .replace(/\n/g, " ")               // Replace remaining newlines with spaces
    .replace(/\s{2,}/g, " ")           // Collapse multiple spaces
    .trim();

  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength).replace(/\s+\S*$/, "") + "...";
}
