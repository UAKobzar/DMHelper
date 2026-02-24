import Anthropic from "@anthropic-ai/sdk";
import { LLMRequest, LLMProvider } from "./types.js";
import { LLMResponse, ChatMessage } from "@dmhelper/shared";

export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    // Separate system from user/assistant messages
    let systemPrompt = "";
    const messages: { role: "user" | "assistant"; content: string }[] = [];

    for (const msg of request.messages) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // First message is system context if it's from the user with our special marker
    if (messages.length > 0 && messages[0].role === "user" &&
        messages[0].content.includes("System context loaded")) {
      // Find a better way to pass system prompt - for now just use it as context
      systemPrompt = messages[0].content;
      // Don't remove it from messages, Anthropic will handle it
    }

    const response = await this.client.messages.create({
      model: request.model,
      max_tokens: 4096,
      messages: messages,
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    return { content };
  }
}
