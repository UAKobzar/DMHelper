import { LLMProvider, LLMProviderConfig } from "./types";
import { AnthropicProvider } from "./anthropic";
import { OpenAIProvider } from "./openai";
import { OllamaProvider } from "./ollama";
import { LlamaCppProvider } from "./llamacpp";

const providerCache = new Map<string, LLMProvider>();

function getCacheKey(name: string, config: LLMProviderConfig): string {
  switch (name) {
    case "anthropic": return `anthropic::${config.anthropicKey}`;
    case "openai":    return `openai::${config.openaiKey}`;
    case "ollama":    return `ollama::${config.ollamaUrl}`;
    case "llamacpp":  return `llamacpp::${config.llamacppUrl}`;
    default: return name;
  }
}

function buildProvider(providerName: string, config: LLMProviderConfig): LLMProvider {
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

export function createProvider(
  providerName: string,
  _model: string,
  config: LLMProviderConfig
): LLMProvider {
  const key = getCacheKey(providerName, config);
  if (providerCache.has(key)) return providerCache.get(key)!;

  const provider = buildProvider(providerName, config);
  providerCache.set(key, provider);
  return provider;
}

export function clearProviderCache(): void {
  providerCache.clear();
}
