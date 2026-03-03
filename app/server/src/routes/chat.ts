import { FastifyInstance } from "fastify";
import { ChatRequest, ResolveProposalsRequest } from "@dmhelper/shared";
import { processChat, resolveProposals } from "../services/chatService";

export async function registerChatRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/api/chat",
    {
      schema: {
        tags: ["chat"],
        summary: "Send a chat message to the LLM",
        body: {
          type: "object",
          required: ["messages", "modeId", "contextFileIds"],
          properties: {
            messages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: { enum: ["user", "assistant", "tool_result"] },
                  content: { type: "string" },
                  toolCalls: { type: "array" },
                  toolCallId: { type: "string" },
                },
              },
            },
            modeId: { type: "string" },
            contextFileIds: { type: "array", items: { type: "string" } },
            settings: {
              type: "object",
              properties: {
                provider: { type: "string" },
                model: { type: "string" },
                apiKey: { type: "string" },
                serverUrl: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              content: { type: "string" },
              provider: { type: "string" },
              model: { type: "string" },
              pendingToolCalls: { type: "array" },
            },
          },
          400: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (request, reply) => {
      try {
        const body = request.body as ChatRequest;
        const response = await processChat(body);
        reply.send(response);
      } catch (error) {
        reply.status(400).send({
          error: error instanceof Error ? error.message : "Chat failed",
        });
      }
    }
  );

  fastify.post(
    "/api/chat/resolve-proposals",
    {
      schema: {
        tags: ["chat"],
        summary: "Resolve LLM file proposals",
        body: {
          type: "object",
          required: ["resolutions", "messages", "modeId", "contextFileIds"],
          properties: {
            resolutions: {
              type: "array",
              items: {
                type: "object",
                required: ["toolCallId", "decision"],
                properties: {
                  toolCallId: { type: "string" },
                  decision: { enum: ["approved", "discarded"] },
                },
              },
            },
            messages: { type: "array", items: { type: "object" } },
            modeId: { type: "string" },
            contextFileIds: { type: "array", items: { type: "string" } },
            settings: { type: "object" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              content: { type: "string" },
              provider: { type: "string" },
              model: { type: "string" },
              pendingToolCalls: { type: "array" },
              toolMessages: { type: "array" },
            },
          },
          400: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (request, reply) => {
      try {
        const body = request.body as ResolveProposalsRequest;
        const response = await resolveProposals(body);
        reply.send(response);
      } catch (error) {
        reply.status(400).send({
          error: error instanceof Error ? error.message : "Resolve failed",
        });
      }
    }
  );
}
