import OpenAI from "openai";
import { LLMRequest, LLMProvider } from "./types";
import { LLMResponse } from "@dmhelper/shared";

export class OpenAIProvider implements LLMProvider {
  readonly name = "openai";
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const response = await this.client.responses.create({
      model: request.model,
      ...(request.systemPrompt ? { instructions: request.systemPrompt } : {}),
      input: request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_output_tokens: 4096,
    });

    const content = response.output_text || "No response generated";

    return { content };
  }
}
