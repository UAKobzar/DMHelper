import { describe, it, expect, beforeAll, vi } from "vitest";
import Fastify, { FastifyInstance } from "fastify";
import { registerSettingsRoutes } from "../../routes/settings";
import * as state from "../../state";

vi.mock("../../state.js");

let app: FastifyInstance;

beforeAll(async () => {
  app = Fastify();
  await registerSettingsRoutes(app);
});

describe("GET /api/settings", () => {
  it("returns current settings", async () => {
    vi.mocked(state.getSettings).mockReturnValue({
      provider: "anthropic",
      model: "claude-opus-4-6",
    });

    const res = await app.inject({
      method: "GET",
      url: "/api/settings",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.provider).toBe("anthropic");
    expect(body.model).toBe("claude-opus-4-6");
  });
});

describe("PUT /api/settings", () => {
  it("updates settings", async () => {
    vi.mocked(state.updateSettings).mockImplementation(() => {});
    vi.mocked(state.getSettings).mockReturnValue({
      provider: "openai",
      model: "gpt-4",
    });

    const res = await app.inject({
      method: "PUT",
      url: "/api/settings",
      payload: {
        provider: "openai",
        model: "gpt-4",
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.provider).toBe("openai");
  });
});
