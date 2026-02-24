import OpenAI from "openai";
import { LLMRequest, LLMProvider } from "./types.js";
import { LLMResponse } from "@dmhelper/shared";

export class OpenAIProvider implements LLMProvider {
  readonly name = "openai";
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: request.model,
      max_tokens: 4096,
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content =
      response.choices[0].message.content || "No response generated";

    return { content };
  }
}
