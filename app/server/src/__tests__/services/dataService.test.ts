import { describe, it, expect, beforeAll, vi } from "vitest";
import fs from "fs/promises";
import path from "path";
import * as dataService from "../../services/dataService";

vi.mock("fs/promises");

beforeAll(async () => {
  const mockFs = vi.mocked(fs);

  // Mock a directory structure:
  // data/
  //   world.md
  //   myworld/
  //     general/
  //       lore.md
  //     npcs/
  //       gandalf.md
  //     empty/         (should be excluded)
  mockFs.readdir.mockImplementation((dirPath: any, options: any) => {
    const p = String(dirPath);
    if (p.endsWith("data")) {
      return Promise.resolve([
        { name: "world.md", isDirectory: () => false },
        { name: "myworld", isDirectory: () => true },
      ] as any);
    }
    if (p.endsWith("myworld")) {
      return Promise.resolve([
        { name: "general", isDirectory: () => true },
        { name: "npcs", isDirectory: () => true },
        { name: "empty", isDirectory: () => true },
      ] as any);
    }
    if (p.endsWith("general")) {
      return Promise.resolve([
        { name: "lore.md", isDirectory: () => false },
      ] as any);
    }
    if (p.endsWith("npcs")) {
      return Promise.resolve([
        { name: "gandalf.md", isDirectory: () => false },
      ] as any);
    }
    if (p.endsWith("empty")) {
      return Promise.resolve([] as any);
    }
    return Promise.resolve([] as any);
  });

  mockFs.readFile.mockImplementation((filepath: any) => {
    const p = String(filepath);
    if (p.includes("world.md")) return Promise.resolve("# World Content");
    if (p.includes("lore.md")) return Promise.resolve("# Lore Content");
    if (p.includes("gandalf.md")) return Promise.resolve("# Gandalf Content");
    return Promise.reject(new Error("File not found"));
  });

  await dataService.loadDataFiles();
});

describe("getDataFiles", () => {
  it("returns a DataTree with worlds and rootFiles", () => {
    const tree = dataService.getDataFiles();
    expect(tree.rootFiles).toHaveLength(1);
    expect(tree.rootFiles[0].id).toBe("world");
    expect(tree.worlds).toHaveLength(1);
    expect(tree.worlds[0].name).toBe("myworld");
  });

  it("builds nested folder structure", () => {
    const tree = dataService.getDataFiles();
    const world = tree.worlds[0];
    expect(world.folders).toHaveLength(2); // general, npcs (empty excluded)
    const general = world.folders.find((f) => f.name === "general")!;
    expect(general.files).toHaveLength(1);
    expect(general.files[0].id).toBe("myworld/general/lore");
  });

  it("excludes empty folders", () => {
    const tree = dataService.getDataFiles();
    const world = tree.worlds[0];
    const empty = world.folders.find((f) => f.name === "empty");
    expect(empty).toBeUndefined();
  });
});

describe("getDataFileContent", () => {
  it("returns root file content", () => {
    expect(dataService.getDataFileContent("world")).toBe("# World Content");
  });

  it("returns nested file content by path-based id", () => {
    expect(dataService.getDataFileContent("myworld/npcs/gandalf")).toBe(
      "# Gandalf Content"
    );
  });

  it("returns null for missing file", () => {
    expect(dataService.getDataFileContent("nonexistent")).toBeNull();
  });

  it("rejects path traversal attempts", () => {
    expect(dataService.getDataFileContent("../etc/passwd")).toBeNull();
    expect(dataService.getDataFileContent("myworld/../../secret")).toBeNull();
  });
});
