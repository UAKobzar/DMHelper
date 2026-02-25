import fs from "fs/promises";
import path from "path";
import { DataFile } from "@dmhelper/shared";
import { config } from "../config";

let dataFilesCache: Map<string, string> | null = null;

export async function loadDataFiles(): Promise<void> {
  dataFilesCache = new Map();
  const files = await fs.readdir(config.DATA_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  for (const file of mdFiles) {
    const content = await fs.readFile(path.join(config.DATA_DIR, file), "utf-8");
    const id = path.basename(file, ".md");
    dataFilesCache.set(id, content);
  }
}

export function getDataFiles(): DataFile[] {
  if (!dataFilesCache) throw new Error("Data files not loaded");
  const result: DataFile[] = [];
  for (const [id, _] of dataFilesCache) {
    result.push({
      id,
      filename: `${id}.md`,
    });
  }
  return result;
}

export function getDataFileContent(id: string): string | null {
  if (!dataFilesCache) throw new Error("Data files not loaded");
  return dataFilesCache.get(id) || null;
}
