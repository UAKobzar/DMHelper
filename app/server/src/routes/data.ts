import { FastifyInstance } from "fastify";
import { getDataFiles, getDataFileContent } from "../services/dataService.js";

export async function registerDataRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/api/data",
    {
      schema: {
        tags: ["data"],
        summary: "List all available context files",
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                filename: { type: "string" },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const files = getDataFiles();
      reply.send(files);
    }
  );

  fastify.get(
    "/api/data/:filename",
    {
      schema: {
        tags: ["data"],
        summary: "Get content of a data file",
        params: {
          type: "object",
          properties: {
            filename: { type: "string" },
          },
        },
        response: {
          200: { type: "string" },
          404: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (request, reply) => {
      const { filename } = request.params as { filename: string };
      const id = filename.replace(/\.md$/, "");
      const content = getDataFileContent(id);

      if (!content) {
        reply.status(404).send({ error: "File not found" });
        return;
      }

      reply.type("text/markdown").send(content);
    }
  );
}
