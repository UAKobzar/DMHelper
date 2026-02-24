import { describe, it, expect, beforeAll, vi } from "vitest";
import { processChat } from "../../services/chatService.js";
import * as modeService from "../../services/modeService.js";
import * as dataService from "../../services/dataService.js";
import * as factory from "../../llm/factory.js";

vi.mock("../../services/modeService.js");
vi.mock("../../services/dataService.js");
vi.mock("../../llm/factory.js");
vi.mock("../../state.js", () => ({
  state: {
    settings: {
      provider: "anthropic",
      model: "claude-opus-4-6",
    },
  },
}));

describe("processChat", () => {
  beforeAll(() => {
    const mockMode = {
      mode: { id: "dm", name: "DM", description: "DM" },
      content: "You are a DM.",
    };
    vi.mocked(modeService.getMode).mockReturnValue(mockMode);
    vi.mocked(dataService.getDataFileContent).mockReturnValue(null);

    const mockProvider = {
      name: "anthropic",
      complete: vi.fn().mockResolvedValue({
        content: "Hello, adventurer!",
      }),
    };
    vi.mocked(factory.createProvider).mockReturnValue(mockProvider);
  });

  it("processes chat successfully", async () => {
    const response = await processChat({
      messages: [{ role: "user", content: "Hello" }],
      modeId: "dm",
      contextFileIds: [],
    });

    expect(response.content).toBe("Hello, adventurer!");
    expect(response.provider).toBe("anthropic");
  });

  it("throws on missing mode", async () => {
    vi.mocked(modeService.getMode).mockReturnValue(null);

    await expect(
      processChat({
        messages: [{ role: "user", content: "Hello" }],
        modeId: "unknown",
        contextFileIds: [],
      })
    ).rejects.toThrow("Mode not found");
  });
});
