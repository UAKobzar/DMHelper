import { describe, it, expect, beforeAll, vi } from "vitest";
import Fastify, { FastifyInstance } from "fastify";
import { registerModesRoutes } from "../../routes/modes";
import * as modeService from "../../services/modeService";

vi.mock("../../services/modeService.js");

let app: FastifyInstance;

beforeAll(async () => {
  app = Fastify();
  await registerModesRoutes(app);
});

describe("GET /api/modes", () => {
  it("returns 200 with mode list", async () => {
    vi.mocked(modeService.getModes).mockReturnValue([
      { id: "dm", name: "Dungeon Master", description: "DM mode" },
    ]);

    const res = await app.inject({
      method: "GET",
      url: "/api/modes",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("dm");
  });

  it("returns empty list when no modes", async () => {
    vi.mocked(modeService.getModes).mockReturnValue([]);

    const res = await app.inject({
      method: "GET",
      url: "/api/modes",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveLength(0);
  });
});
