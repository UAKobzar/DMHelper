import {
  ChatRequest,
  ChatResponse,
  ChatMessage,
  ResolveProposalsRequest,
  FileProposal,
} from "@dmhelper/shared";
import { getMode } from "./modeService";
import { getDataFileContent, validateProposal, createDataFile, updateDataFile } from "./dataService";
import { createProvider } from "../llm/factory";
import { state } from "../state";
import { getToolDefinitions } from "../tools/registry";

export async function processChat(req: ChatRequest): Promise<ChatResponse> {
  const provider = req.settings?.provider || state.settings.provider;
  const model = req.settings?.model || state.settings.model;
  const serverUrl = req.settings?.serverUrl || state.settings.serverUrl;

  const modeData = getMode(req.modeId);
  if (!modeData) throw new Error(`Mode not found: ${req.modeId}`);

  let systemPrompt = modeData.content;
  if (req.contextFileIds && req.contextFileIds.length > 0) {
    const contextParts: string[] = [];
    for (const fileId of req.contextFileIds) {
      const content = getDataFileContent(fileId);
      if (content) contextParts.push(content);
    }
    if (contextParts.length > 0) {
      systemPrompt += "\n\n# World Context\n\n" + contextParts.join("\n\n---\n\n");
    }
  }

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
    tools: getToolDefinitions(),
  });

  return {
    content: response.content,
    provider,
    model,
    pendingToolCalls: response.toolCalls?.length ? response.toolCalls : undefined,
  };
}

export async function resolveProposals(req: ResolveProposalsRequest): Promise<ChatResponse> {
  const { resolutions, messages, modeId, contextFileIds } = req;
  const provider = req.settings?.provider || state.settings.provider;
  const model = req.settings?.model || state.settings.model;
  const serverUrl = req.settings?.serverUrl || state.settings.serverUrl;

  // Find the last assistant message with tool calls
  const lastAssistant = [...messages].reverse().find(
    (m) => m.role === "assistant" && m.toolCalls?.length
  );

  // Build tool_result messages and execute approved writes
  const toolResultMessages: ChatMessage[] = [];
  for (const resolution of resolutions) {
    const toolCall = lastAssistant?.toolCalls?.find(
      (p) => p.toolCallId === resolution.toolCallId
    );
    const proposal: FileProposal | undefined =
      toolCall?.toolName === "propose_file_change" ? toolCall : undefined;

    let resultContent: string;
    if (resolution.decision === "discarded" || !proposal) {
      resultContent = "User declined this change.";
    } else {
      const error = await validateProposal(proposal);
      if (error) {
        resultContent = `Error: ${error}`;
      } else if (proposal.operation === "create") {
        await createDataFile(proposal.fileId, proposal.content!);
        resultContent = `Created file: ${proposal.fileId}.md`;
      } else {
        await updateDataFile(proposal.fileId, proposal.edits!);
        resultContent = `Updated file: ${proposal.fileId}.md`;
      }
    }

    toolResultMessages.push({
      role: "tool_result",
      content: resultContent,
      toolCallId: resolution.toolCallId,
    });
  }

  // Append tool results to history and call LLM for follow-up
  const updatedMessages = [...messages, ...toolResultMessages];

  const modeData = getMode(modeId);
  if (!modeData) throw new Error(`Mode not found: ${modeId}`);
  let systemPrompt = modeData.content;
  if (contextFileIds?.length) {
    const parts = contextFileIds
      .map((id) => getDataFileContent(id))
      .filter(Boolean) as string[];
    if (parts.length) {
      systemPrompt += "\n\n# World Context\n\n" + parts.join("\n\n---\n\n");
    }
  }

  const llmProvider = createProvider(provider, model, {
    anthropicKey: process.env.ANTHROPIC_API_KEY,
    openaiKey: process.env.OPENAI_API_KEY,
    ollamaUrl: process.env.OLLAMA_URL,
    llamacppUrl: process.env.LLAMACPP_URL,
    serverUrl,
  });

  const followUp = await llmProvider.complete({
    messages: updatedMessages,
    model,
    systemPrompt,
    tools: getToolDefinitions(),
  });

  const followUpAssistantMsg: ChatMessage = {
    role: "assistant",
    content: followUp.content,
    ...(followUp.toolCalls?.length ? { toolCalls: followUp.toolCalls } : {}),
  };

  return {
    content: followUp.content,
    provider,
    model,
    pendingToolCalls: followUp.toolCalls?.length ? followUp.toolCalls : undefined,
    toolMessages: [...toolResultMessages, followUpAssistantMsg],
  };
}
