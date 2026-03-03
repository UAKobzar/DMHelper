import OpenAI from "openai";
import { LLMRequest, LLMProvider } from "./types";
import { LLMResponse, ChatMessage, FileProposal } from "@dmhelper/shared";

export class LlamaCppProvider implements LLMProvider {
  readonly name = "llamacpp";
  private client: OpenAI;

  constructor(baseUrl: string = "http://localhost:8080") {
    this.client = new OpenAI({
      apiKey: "not-needed",
      baseURL: `${baseUrl}/v1`,
    });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const messages = buildChatCompletionMessages(request.messages, request.systemPrompt);

    const params: OpenAI.ChatCompletionCreateParamsNonStreaming = {
      model: request.model,
      max_tokens: 4096,
      messages,
    };

    if (request.tools?.length) {
      params.tools = request.tools.map((t) => ({
        type: "function" as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
      params.tool_choice = "auto";
    }

    const response = await this.client.chat.completions.create(params);
    const msg = response.choices[0].message;
    const content = msg.content || "";

    const toolCalls: FileProposal[] = (msg.tool_calls || []).map((tc) => {
      const args = JSON.parse(tc.function.arguments);
      return {
        toolName: "propose_file_change" as const,
        toolCallId: tc.id,
        fileId: args.fileId,
        operation: args.operation as "create" | "update",
        content: args.content,
        edits: args.edits,
      };
    });

    return { content, toolCalls: toolCalls.length ? toolCalls : undefined };
  }
}

function buildChatCompletionMessages(
  messages: ChatMessage[],
  systemPrompt?: string
): OpenAI.ChatCompletionMessageParam[] {
  const result: OpenAI.ChatCompletionMessageParam[] = [];
  if (systemPrompt) result.push({ role: "system", content: systemPrompt });
  for (const msg of messages) {
    if (msg.role === "tool_result") {
      result.push({
        role: "tool",
        content: msg.content,
        tool_call_id: msg.toolCallId!,
      });
    } else if (msg.role === "assistant" && msg.toolCalls?.length) {
      result.push({
        role: "assistant",
        content: msg.content || null,
        tool_calls: msg.toolCalls
          .filter((tc) => tc.toolName === "propose_file_change")
          .map((tc) => {
            const fp = tc as FileProposal;
            return {
              id: fp.toolCallId,
              type: "function" as const,
              function: {
                name: "propose_file_change",
                arguments: JSON.stringify({
                  fileId: fp.fileId,
                  operation: fp.operation,
                  content: fp.content,
                  edits: fp.edits,
                }),
              },
            };
          }),
      });
    } else {
      result.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }
  }
  return result;
}
