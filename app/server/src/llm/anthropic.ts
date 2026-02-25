import Anthropic from "@anthropic-ai/sdk";
import { LLMRequest, LLMProvider } from "./types";
import { LLMResponse } from "@dmhelper/shared";

export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const messages = request.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await this.client.messages.create({
      model: request.model,
      max_tokens: 4096,
      ...(request.systemPrompt ? { system: request.systemPrompt } : {}),
      messages,
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    return { content };
  }
}
