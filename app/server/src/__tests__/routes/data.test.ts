import { describe, it, expect, beforeAll, vi } from "vitest";
import Fastify, { FastifyInstance } from "fastify";
import { registerDataRoutes } from "../../routes/data";
import * as dataService from "../../services/dataService";

vi.mock("../../services/dataService.js");

let app: FastifyInstance;

beforeAll(async () => {
  app = Fastify();
  await registerDataRoutes(app);
});

describe("GET /api/data", () => {
  it("returns a data tree", async () => {
    vi.mocked(dataService.getDataFiles).mockReturnValue({
      worlds: [
        {
          name: "myworld",
          path: "myworld",
          folders: [
            {
              name: "npcs",
              path: "myworld/npcs",
              folders: [],
              files: [{ id: "myworld/npcs/gandalf", filename: "gandalf.md" }],
            },
          ],
          files: [],
        },
      ],
      rootFiles: [{ id: "world", filename: "world.md" }],
    });

    const res = await app.inject({
      method: "GET",
      url: "/api/data",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.worlds).toHaveLength(1);
    expect(body.rootFiles).toHaveLength(1);
    expect(body.worlds[0].name).toBe("myworld");
    expect(body.worlds[0].folders[0].files[0].id).toBe("myworld/npcs/gandalf");
  });
});

describe("GET /api/data/*", () => {
  it("returns file content for root file", async () => {
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

  it("returns file content for nested path", async () => {
    vi.mocked(dataService.getDataFileContent).mockReturnValue(
      "# Gandalf Content"
    );

    const res = await app.inject({
      method: "GET",
      url: "/api/data/myworld/npcs/gandalf.md",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toBe("# Gandalf Content");
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
