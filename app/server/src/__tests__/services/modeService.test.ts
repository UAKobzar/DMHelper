import { describe, it, expect, beforeAll, vi } from "vitest";
import fs from "fs/promises";
import * as modeService from "../../services/modeService";

vi.mock("fs/promises");

beforeAll(async () => {
  const mockFs = vi.mocked(fs);

  mockFs.readdir.mockResolvedValue(["dungeon-master.md", "narrator.md"] as any);
  mockFs.readFile.mockImplementation((filepath: any) => {
    const p = String(filepath);
    if (p.includes("dungeon-master.md")) {
      return Promise.resolve(`---
name: Dungeon Master
description: Narrate as a DM
---

You are a DM.`);
    }
    if (p.includes("narrator.md")) {
      return Promise.resolve(`---
name: Narrator
description: Tell stories
---

You are a narrator.`);
    }
    return Promise.reject(new Error("File not found"));
  });

  await modeService.loadModes();
});

describe("getModes", () => {
  it("returns all loaded modes", () => {
    const modes = modeService.getModes();
    expect(modes).toHaveLength(2);
    expect(modes[0].name).toBeDefined();
  });
});

describe("getMode", () => {
  it("returns specific mode with content", () => {
    const mode = modeService.getMode("dungeon-master");
    expect(mode).toBeDefined();
    expect(mode?.mode.name).toBe("Dungeon Master");
    expect(mode?.content).toContain("You are a DM");
  });

  it("returns null for missing mode", () => {
    const mode = modeService.getMode("nonexistent");
    expect(mode).toBeNull();
  });
});
