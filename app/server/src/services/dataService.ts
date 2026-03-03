import fs from "fs/promises";
import path from "path";
import { DataFile, DataFolder, DataTree, FileProposal, SearchReplacePair } from "@dmhelper/shared";
import { config } from "../config";

let dataFilesCache: Map<string, string> | null = null;
let dataTreeCache: DataTree | null = null;

async function walkDirectory(
  dir: string,
  relativePath: string,
  cache: Map<string, string>
): Promise<DataFolder> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const folders: DataFolder[] = [];
  const files: DataFile[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = relativePath
      ? `${relativePath}/${entry.name}`
      : entry.name;

    if (entry.isDirectory()) {
      const subfolder = await walkDirectory(fullPath, relPath, cache);
      // Only include non-empty folders
      if (subfolder.folders.length > 0 || subfolder.files.length > 0) {
        folders.push(subfolder);
      }
    } else if (entry.name.endsWith(".md")) {
      const content = await fs.readFile(fullPath, "utf-8");
      const id = relPath.replace(/\.md$/, "");
      cache.set(id, content);
      files.push({ id, filename: entry.name });
    }
  }

  return {
    name: path.basename(dir),
    path: relativePath,
    folders,
    files,
  };
}

export async function loadDataFiles(): Promise<void> {
  dataFilesCache = new Map();
  const entries = await fs.readdir(config.DATA_DIR, { withFileTypes: true });

  const worlds: DataFolder[] = [];
  const rootFiles: DataFile[] = [];

  for (const entry of entries) {
    const fullPath = path.join(config.DATA_DIR, entry.name);

    if (entry.isDirectory()) {
      const folder = await walkDirectory(
        fullPath,
        entry.name,
        dataFilesCache
      );
      if (folder.folders.length > 0 || folder.files.length > 0) {
        worlds.push(folder);
      }
    } else if (entry.name.endsWith(".md")) {
      const content = await fs.readFile(fullPath, "utf-8");
      const id = path.basename(entry.name, ".md");
      dataFilesCache.set(id, content);
      rootFiles.push({ id, filename: entry.name });
    }
  }

  dataTreeCache = { worlds, rootFiles };
}

export function getDataFiles(): DataTree {
  if (!dataTreeCache) throw new Error("Data files not loaded");
  return dataTreeCache;
}

export function getDataFileContent(id: string): string | null {
  if (!dataFilesCache) throw new Error("Data files not loaded");
  // Guard against path traversal
  if (id.includes("..")) return null;
  return dataFilesCache.get(id) || null;
}

// ── File proposal helpers ─────────────────────────────────────────────────────

function safeDataPath(fileId: string): string | null {
  if (fileId.includes("..") || path.isAbsolute(fileId)) return null;
  return path.join(config.DATA_DIR, `${fileId}.md`);
}

/** Validates a proposal WITHOUT writing anything. Returns error string or null. */
export async function validateProposal(proposal: FileProposal): Promise<string | null> {
  const filePath = safeDataPath(proposal.fileId);
  if (!filePath) return "Invalid file path";

  if (proposal.operation === "create") {
    try {
      await fs.access(filePath);
      return `File already exists: ${proposal.fileId}`;
    } catch {
      // Good — file does not exist
    }
    if (!proposal.content) return "content is required for create";
  } else {
    let existing: string;
    try {
      existing = await fs.readFile(filePath, "utf-8");
    } catch {
      return `File not found: ${proposal.fileId}`;
    }
    if (!proposal.edits?.length) return "edits array is required for update";
    for (const edit of proposal.edits) {
      if (!existing.includes(edit.search)) {
        return `Search string not found: "${edit.search.slice(0, 60)}"`;
      }
    }
  }
  return null;
}

/** Creates a new data file. Caller must pre-validate. */
export async function createDataFile(fileId: string, content: string): Promise<void> {
  const filePath = safeDataPath(fileId)!;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf-8");
  await loadDataFiles();
}

/** Updates an existing file by applying search/replace pairs. Caller must pre-validate. */
export async function updateDataFile(fileId: string, edits: SearchReplacePair[]): Promise<void> {
  const filePath = safeDataPath(fileId)!;
  let content = await fs.readFile(filePath, "utf-8");
  for (const { search, replace } of edits) {
    content = content.replace(search, replace);
  }
  await fs.writeFile(filePath, content, "utf-8");
  await loadDataFiles();
}
