import { existsSync } from "fs";
import path from "path";

/**
 * Returns the thumbnail path if it exists on disk, otherwise the original path.
 */
export function thumb(imagePath: string | null | undefined): string {
  if (!imagePath) return "";
  const thumbPath = imagePath.replace(".webp", "-thumb.webp");
  const diskPath = path.join(process.cwd(), "public", thumbPath);
  if (existsSync(diskPath)) return thumbPath;
  return imagePath;
}
