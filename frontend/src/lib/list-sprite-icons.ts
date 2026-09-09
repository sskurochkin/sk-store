import { readFile } from "node:fs/promises";
import path from "node:path";

const ID_PATTERN = /id="([^"]+)"/g;

/**
 * Reads icon symbol ids from the generated SVG sprite.
 * Returns [] when the sprite is missing or empty.
 */
export async function listSpriteIconNames(): Promise<string[]> {
  const spritePath = path.join(process.cwd(), "public", "icons", "sprite.svg");

  let content: string;
  try {
    content = await readFile(spritePath, "utf8");
  } catch {
    return [];
  }

  const names: string[] = [];
  const seen = new Set<string>();

  for (const match of content.matchAll(ID_PATTERN)) {
    const id = match[1]?.trim();
    if (!id || seen.has(id)) {
      continue;
    }
    seen.add(id);
    names.push(id);
  }

  return names.sort((a, b) => a.localeCompare(b, "en"));
}
