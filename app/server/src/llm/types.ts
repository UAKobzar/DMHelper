import { ChatMessage, LLMResponse } from "@dmhelper/shared";

export interface LLMRequest {
  messages: ChatMessage[];
  model: string;
}

export interface LLMProvider {
  readonly name: string;
  complete(request: LLMRequest): Promise<LLMResponse>;
}

export interface LLMProviderConfig {
  anthropicKey?: string;
  openaiKey?: string;
  ollamaUrl?: string;
  llamacppUrl?: string;
  serverUrl?: string;
}
