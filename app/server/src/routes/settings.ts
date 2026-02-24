import { FastifyInstance } from "fastify";
import { Settings } from "@dmhelper/shared";
import { getSettings, updateSettings } from "../state.js";

export async function registerSettingsRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/api/settings",
    {
      schema: {
        tags: ["settings"],
        summary: "Get current LLM settings",
        response: {
          200: {
            type: "object",
            properties: {
              provider: { type: "string" },
              model: { type: "string" },
              serverUrl: { type: ["string", "null"] },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const settings = getSettings();
      reply.send(settings);
    }
  );

  fastify.put(
    "/api/settings",
    {
      schema: {
        tags: ["settings"],
        summary: "Update LLM settings",
        body: {
          type: "object",
          properties: {
            provider: { type: "string" },
            model: { type: "string" },
            serverUrl: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              provider: { type: "string" },
              model: { type: "string" },
              serverUrl: { type: ["string", "null"] },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const updates = request.body as Partial<Settings>;
      updateSettings(updates);
      const settings = getSettings();
      reply.send(settings);
    }
  );
}
