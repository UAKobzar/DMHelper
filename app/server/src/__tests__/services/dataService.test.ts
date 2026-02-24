import { describe, it, expect, beforeAll, vi } from "vitest";
import { promises as fs } from "fs";
import * as dataService from "../../services/dataService.js";

vi.mock("fs/promises");

beforeAll(async () => {
  const mockFs = vi.mocked(fs);

  mockFs.readdir.mockResolvedValue(["world.md", "creatures.md"]);
  mockFs.readFile.mockImplementation((filepath) => {
    if (filepath.includes("world.md")) {
      return Promise.resolve("# World Content");
    }
    if (filepath.includes("creatures.md")) {
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
