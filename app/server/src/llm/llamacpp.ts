import OpenAI from "openai";
import { LLMRequest, LLMProvider } from "./types.js";
import { LLMResponse } from "@dmhelper/shared";

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
