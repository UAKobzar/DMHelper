import { LLMProvider, LLMProviderConfig } from "./types.js";
import { AnthropicProvider } from "./anthropic.js";
import { OpenAIProvider } from "./openai.js";
import { OllamaProvider } from "./ollama.js";
import { LlamaCppProvider } from "./llamacpp.js";

export function createProvider(
  providerName: string,
  model: string,
  config: LLMProviderConfig
): LLMProvider {
  switch (providerName) {
    case "anthropic":
      return new AnthropicProvider(config.anthropicKey || "");
    case "openai":
      return new OpenAIProvider(config.openaiKey || "");
    case "ollama":
      return new OllamaProvider(config.ollamaUrl);
    case "llamacpp":
      return new LlamaCppProvider(config.llamacppUrl);
    default:
      throw new Error(`Unknown LLM provider: ${providerName}`);
  }
}
