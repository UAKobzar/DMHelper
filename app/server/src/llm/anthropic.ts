import Anthropic from "@anthropic-ai/sdk";
import { LLMRequest, LLMProvider } from "./types";
import { LLMResponse, ChatMessage, FileProposal, SearchReplacePair } from "@dmhelper/shared";

export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const messages = buildAnthropicMessages(request.messages);

    const params: Anthropic.MessageCreateParams = {
      model: request.model,
      max_tokens: 4096,
      ...(request.systemPrompt ? { system: request.systemPrompt } : {}),
      messages,
    };

    if (request.tools?.length) {
      params.tools = request.tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters as Anthropic.Tool["input_schema"],
      }));
    }

    const response = await this.client.messages.create(params);

    const textContent = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as Anthropic.TextBlock).text)
      .join("\n");

    const toolCalls: FileProposal[] = response.content
      .filter((b) => b.type === "tool_use")
      .map((b) => {
        const block = b as Anthropic.ToolUseBlock;
        const input = block.input as Record<string, unknown>;
        return {
          toolName: "propose_file_change" as const,
          toolCallId: block.id,
          fileId: input.fileId as string,
          operation: input.operation as "create" | "update",
          content: input.content as string | undefined,
          edits: input.edits as SearchReplacePair[] | undefined,
        };
      });

    return {
      content: textContent,
      toolCalls: toolCalls.length ? toolCalls : undefined,
    };
  }
}

function buildAnthropicMessages(messages: ChatMessage[]): Anthropic.MessageParam[] {
  const result: Anthropic.MessageParam[] = [];
  for (const msg of messages) {
    if (msg.role === "tool_result") {
      result.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: msg.toolCallId!,
            content: msg.content,
          },
        ],
      });
    } else if (msg.role === "assistant" && msg.toolCalls?.length) {
      const content: Anthropic.ContentBlock[] = [];
      if (msg.content) content.push({ type: "text", text: msg.content });
      for (const tc of msg.toolCalls) {
        if (tc.toolName === "propose_file_change") {
          content.push({
            type: "tool_use",
            id: tc.toolCallId,
            name: "propose_file_change",
            input: {
              fileId: tc.fileId,
              operation: tc.operation,
              ...(tc.content !== undefined ? { content: tc.content } : {}),
              ...(tc.edits !== undefined ? { edits: tc.edits } : {}),
            },
          });
        }
      }
      result.push({ role: "assistant", content });
    } else {
      result.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }
  }
  return result;
}
