import { ChatRequest, ChatResponse } from "@dmhelper/shared";
import { getMode } from "./modeService";
import { getDataFileContent } from "./dataService";
import { createProvider } from "../llm/factory";
import { state } from "../state";

export async function processChat(req: ChatRequest): Promise<ChatResponse> {
  // Get effective settings (request overrides take precedence)
  const provider = req.settings?.provider || state.settings.provider;
  const model = req.settings?.model || state.settings.model;
  const serverUrl = req.settings?.serverUrl || state.settings.serverUrl;

  // Load mode
  const modeData = getMode(req.modeId);
  if (!modeData) {
    throw new Error(`Mode not found: ${req.modeId}`);
  }

  // Build system prompt
  let systemPrompt = modeData.content;

  // Append context files if selected
  if (req.contextFileIds && req.contextFileIds.length > 0) {
    const contextParts: string[] = [];
    for (const fileId of req.contextFileIds) {
      const content = getDataFileContent(fileId);
      if (content) {
        contextParts.push(content);
      }
    }
    if (contextParts.length > 0) {
      systemPrompt += "\n\n# World Context\n\n" + contextParts.join("\n\n---\n\n");
    }
  }

  // Call LLM provider
  const llmProvider = createProvider(provider, model, {
    anthropicKey: process.env.ANTHROPIC_API_KEY,
    openaiKey: process.env.OPENAI_API_KEY,
    ollamaUrl: process.env.OLLAMA_URL,
    llamacppUrl: process.env.LLAMACPP_URL,
    serverUrl,
  });

  const response = await llmProvider.complete({
    messages: req.messages,
    model,
    systemPrompt,
  });

  return {
    content: response.content,
    provider,
    model,
  };
}
