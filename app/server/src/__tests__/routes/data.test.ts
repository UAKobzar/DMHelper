import { describe, it, expect, beforeAll, vi } from "vitest";
import Fastify, { FastifyInstance } from "fastify";
import { registerDataRoutes } from "../../routes/data.js";
import * as dataService from "../../services/dataService.js";

vi.mock("../../services/dataService.js");

let app: FastifyInstance;

beforeAll(async () => {
  app = Fastify();
  await registerDataRoutes(app);
});

describe("GET /api/data", () => {
  it("returns list of data files", async () => {
    vi.mocked(dataService.getDataFiles).mockReturnValue([
      { id: "world", filename: "world.md" },
    ]);

    const res = await app.inject({
      method: "GET",
      url: "/api/data",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("world");
  });
});

describe("GET /api/data/:filename", () => {
  it("returns file content", async () => {
    vi.mocked(dataService.getDataFileContent).mockReturnValue(
      "# Test Content"
    );

    const res = await app.inject({
      method: "GET",
      url: "/api/data/test.md",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toBe("# Test Content");
  });

  it("returns 404 for missing file", async () => {
    vi.mocked(dataService.getDataFileContent).mockReturnValue(null);

    const res = await app.inject({
      method: "GET",
      url: "/api/data/missing.md",
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.body);
    expect(body.error).toBeDefined();
  });
});
