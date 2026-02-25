import { describe, it, expect, beforeAll, vi } from "vitest";
import fs from "fs/promises";
import * as dataService from "../../services/dataService";

vi.mock("fs/promises");

beforeAll(async () => {
  const mockFs = vi.mocked(fs);

  mockFs.readdir.mockResolvedValue(["world.md", "creatures.md"] as any);
  mockFs.readFile.mockImplementation((filepath: any) => {
    const p = String(filepath);
    if (p.includes("world.md")) {
      return Promise.resolve("# World Content");
    }
    if (p.includes("creatures.md")) {
      return Promise.resolve("# Creatures Content");
    }
    return Promise.reject(new Error("File not found"));
  });

  await dataService.loadDataFiles();
});

describe("getDataFiles", () => {
  it("returns list of data files", () => {
    const files = dataService.getDataFiles();
    expect(files).toHaveLength(2);
    expect(files[0].id).toBeDefined();
  });
});

describe("getDataFileContent", () => {
  it("returns file content", () => {
    const content = dataService.getDataFileContent("world");
    expect(content).toBe("# World Content");
  });

  it("returns null for missing file", () => {
    const content = dataService.getDataFileContent("nonexistent");
    expect(content).toBeNull();
  });
});
