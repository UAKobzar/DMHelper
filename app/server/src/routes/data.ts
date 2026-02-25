import { FastifyInstance } from "fastify";
import { getDataFiles, getDataFileContent } from "../services/dataService";

const dataFileSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    filename: { type: "string" },
  },
} as const;

const dataFolderSchema: Record<string, unknown> = {
  type: "object",
  properties: {
    name: { type: "string" },
    path: { type: "string" },
    folders: {
      type: "array",
      items: { $ref: "#/properties/worlds/items" },
    },
    files: { type: "array", items: dataFileSchema },
  },
};

export async function registerDataRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/api/data",
    {
      schema: {
        tags: ["data"],
        summary: "List all context files as a tree",
        response: {
          200: {
            type: "object",
            properties: {
              worlds: {
                type: "array",
                items: dataFolderSchema,
              },
              rootFiles: {
                type: "array",
                items: dataFileSchema,
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const tree = getDataFiles();
      reply.send(tree);
    }
  );

  fastify.get(
    "/api/data/*",
    {
      schema: {
        tags: ["data"],
        summary: "Get content of a data file by path",
        response: {
          200: { type: "string" },
          404: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (request, reply) => {
      const { "*": filePath } = request.params as { "*": string };
      const id = filePath.replace(/\.md$/, "");
      const content = getDataFileContent(id);

      if (!content) {
        reply.status(404).send({ error: "File not found" });
        return;
      }

      reply.type("text/markdown").send(content);
    }
  );
}
