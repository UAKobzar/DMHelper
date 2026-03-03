import OpenAI from "openai";
import { LLMRequest, LLMProvider } from "./types";
import { LLMResponse, ChatMessage, FileProposal } from "@dmhelper/shared";

export class OpenAIProvider implements LLMProvider {
  readonly name = "openai";
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const input = buildOpenAIInput(request.messages, request.systemPrompt);

    const params: OpenAI.Responses.ResponseCreateParamsNonStreaming = {
      model: request.model,
      input,
      max_output_tokens: 4096,
    };

    if (request.tools?.length) {
      params.tools = request.tools.map((t) => ({
        type: "function" as const,
        name: t.name,
        description: t.description,
        parameters: t.parameters,
        strict: true,
      }));
    }

    const response = await this.client.responses.create(params);

    const content = response.output_text || "";

    const toolCalls: FileProposal[] = (response.output || [])
      .filter((item) => item.type === "function_call")
      .map((item) => {
        const fc = item as OpenAI.Responses.ResponseFunctionToolCall;
        const args = JSON.parse(fc.arguments);
        return {
          toolName: "propose_file_change" as const,
          toolCallId: fc.call_id,
          fileId: args.fileId,
          operation: args.operation as "create" | "update",
          content: args.content,
          edits: args.edits,
        };
      });

    return { content, toolCalls: toolCalls.length ? toolCalls : undefined };
  }
}

function buildOpenAIInput(messages: ChatMessage[], systemPrompt?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = [];
  if (systemPrompt) items.push({ role: "system", content: systemPrompt });
  for (const msg of messages) {
    if (msg.role === "tool_result") {
      items.push({
        type: "function_call_output",
        call_id: msg.toolCallId!,
        output: msg.content,
      });
    } else if (msg.role === "assistant" && msg.toolCalls?.length) {
      for (const tc of msg.toolCalls) {
        if (tc.toolName === "propose_file_change") {
          items.push({
            type: "function_call",
            call_id: tc.toolCallId,
            name: "propose_file_change",
            arguments: JSON.stringify({
              fileId: tc.fileId,
              operation: tc.operation,
              content: tc.content,
              edits: tc.edits,
            }),
          });
        }
      }
      if (msg.content) items.push({ role: "assistant", content: msg.content });
    } else {
      items.push({ role: msg.role as "user" | "assistant", content: msg.content });
    }
  }
  return items;
}
