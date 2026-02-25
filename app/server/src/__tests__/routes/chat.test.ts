import { describe, it, expect, beforeAll, vi } from "vitest";
import Fastify, { FastifyInstance } from "fastify";
import { registerChatRoutes } from "../../routes/chat";
import * as chatService from "../../services/chatService";

vi.mock("../../services/chatService.js");

let app: FastifyInstance;

beforeAll(async () => {
  app = Fastify();
  await registerChatRoutes(app);
});

describe("POST /api/chat", () => {
  it("returns chat response", async () => {
    vi.mocked(chatService.processChat).mockResolvedValue({
      content: "Hello, adventurer!",
      provider: "anthropic",
      model: "claude-opus-4-6",
    });

    const res = await app.inject({
      method: "POST",
      url: "/api/chat",
      payload: {
        messages: [{ role: "user", content: "Hello" }],
        modeId: "dm",
        contextFileIds: [],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.content).toBe("Hello, adventurer!");
    expect(body.provider).toBe("anthropic");
  });

  it("returns 400 on error", async () => {
    vi.mocked(chatService.processChat).mockRejectedValue(
      new Error("Mode not found")
    );

    const res = await app.inject({
      method: "POST",
      url: "/api/chat",
      payload: {
        messages: [{ role: "user", content: "Hello" }],
        modeId: "unknown",
        contextFileIds: [],
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toBeDefined();
  });
});
