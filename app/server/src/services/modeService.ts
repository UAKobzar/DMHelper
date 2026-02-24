import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { Mode } from "@dmhelper/shared";
import { config } from "../config.js";

let modesCache: Map<string, { mode: Mode; content: string }> | null = null;

export async function loadModes(): Promise<void> {
  modesCache = new Map();
  const files = await fs.readdir(config.MODES_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  for (const file of mdFiles) {
    const content = await fs.readFile(path.join(config.MODES_DIR, file), "utf-8");
    const { data, content: body } = matter(content);

    const id = path.basename(file, ".md");
    const mode: Mode = {
      id,
      name: data.name || id,
      description: data.description || "",
    };

    modesCache.set(id, { mode, content: body });
  }
}

export function getModes(): Mode[] {
  if (!modesCache) throw new Error("Modes not loaded");
  return Array.from(modesCache.values()).map((m) => m.mode);
}

export function getMode(id: string): { mode: Mode; content: string } | null {
  if (!modesCache) throw new Error("Modes not loaded");
  return modesCache.get(id) || null;
}
