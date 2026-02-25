import { FastifyInstance } from "fastify";
import { getModes } from "../services/modeService";

export async function registerModesRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/api/modes",
    {
      schema: {
        tags: ["modes"],
        summary: "List all available DM modes",
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                description: { type: "string" },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const modes = getModes();
      reply.send(modes);
    }
  );
}
