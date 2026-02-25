import { describe, it, expect, beforeAll, vi } from "vitest";
import { processChat } from "../../services/chatService";
import * as modeService from "../../services/modeService";
import * as dataService from "../../services/dataService";
import * as factory from "../../llm/factory";

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
  const mockComplete = vi.fn().mockResolvedValue({ content: "Hello, adventurer!" });

  beforeAll(() => {
    const mockMode = {
      mode: { id: "dm", name: "DM", description: "DM" },
      content: "You are a DM.",
    };
    vi.mocked(modeService.getMode).mockReturnValue(mockMode);
    vi.mocked(dataService.getDataFileContent).mockReturnValue(null);

    vi.mocked(factory.createProvider).mockReturnValue({
      name: "anthropic",
      complete: mockComplete,
    });
  });

  it("processes chat successfully", async () => {
    const response = await processChat({
      messages: [{ role: "user", content: "Hello" }],
      modeId: "dm",
      contextFileIds: [],
    });

    expect(response.content).toBe("Hello, adventurer!");
    expect(response.provider).toBe("anthropic");

    const llmRequest = mockComplete.mock.calls[0][0];
    expect(llmRequest.systemPrompt).toBe("You are a DM.");
    expect(llmRequest.messages).toEqual([{ role: "user", content: "Hello" }]);
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
