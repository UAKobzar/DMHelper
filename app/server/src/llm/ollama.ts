import { LLMRequest, LLMProvider } from "./types";
import { LLMResponse, ChatMessage, FileProposal } from "@dmhelper/shared";

export class OllamaProvider implements LLMProvider {
  readonly name = "ollama";
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:11434") {
    this.baseUrl = baseUrl;
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const body: Record<string, unknown> = {
      model: request.model,
      messages: buildOllamaMessages(request.messages, request.systemPrompt),
      stream: false,
    };

    if (request.tools?.length) {
      body.tools = request.tools.map((t) => ({
        type: "function",
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
    }

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.message?.content || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolCalls: FileProposal[] = (data.message?.tool_calls || []).map((tc: any) => ({
      toolName: "propose_file_change" as const,
      toolCallId: tc.id || `ollama-${Date.now()}-${Math.random()}`,
      fileId: tc.function.arguments.fileId,
      operation: tc.function.arguments.operation as "create" | "update",
      content: tc.function.arguments.content,
      edits: tc.function.arguments.edits,
    }));

    return { content, toolCalls: toolCalls.length ? toolCalls : undefined };
  }
}

function buildOllamaMessages(messages: ChatMessage[], systemPrompt?: string) {
  const result: Array<{ role: string; content: string }> = [];
  if (systemPrompt) result.push({ role: "system", content: systemPrompt });
  for (const msg of messages) {
    if (msg.role === "tool_result") {
      result.push({ role: "tool", content: msg.content });
    } else {
      result.push({ role: msg.role, content: msg.content });
    }
  }
  return result;
}
