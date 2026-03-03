// Mode with parsed frontmatter
export interface Mode {
  id: string;
  name: string;
  description: string;
}

// Data file reference
export interface DataFile {
  id: string;
  filename: string;
}

// Recursive folder structure for data tree
export interface DataFolder {
  name: string;
  path: string;
  folders: DataFolder[];
  files: DataFile[];
}

// Tree of data files organized by world subfolders
export interface DataTree {
  worlds: DataFolder[];
  rootFiles: DataFile[];
}

// ── Tool call types ───────────────────────────────────────────────────────────

export interface SearchReplacePair {
  search: string;   // exact string to find in file
  replace: string;  // replacement
}

/** Base interface for all tool calls. Discriminate on `toolName`. */
export interface ToolCall {
  toolCallId: string;
  toolName: string;
}

/** Tool call for `propose_file_change`. Narrow with: toolName === "propose_file_change" */
export interface FileProposal extends ToolCall {
  toolName: "propose_file_change";
  fileId: string;
  operation: "create" | "update";
  content?: string;
  edits?: SearchReplacePair[];
  validationError?: string;
}

/** Union of all concrete tool call types. */
export type AnyToolCall = FileProposal;

/** User's resolution for a single tool call. */
export interface ToolCallResolution {
  toolCallId: string;
  decision: "approved" | "discarded";
}

/** Tool definition passed to LLM providers. */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

// ── Chat ─────────────────────────────────────────────────────────────────────

// Chat message
export interface ChatMessage {
  role: "user" | "assistant" | "tool_result";
  content: string;
  /** Present on assistant messages when LLM invoked tools. */
  toolCalls?: AnyToolCall[];
  /** Present on tool_result messages to link back to the originating tool call. */
  toolCallId?: string;
}

// LLM request for chat
export interface ChatRequest {
  messages: ChatMessage[];
  modeId: string;
  contextFileIds: string[];
  settings?: {
    provider?: string;
    model?: string;
    apiKey?: string;
    serverUrl?: string;
  };
}

// LLM response
export interface ChatResponse {
  content: string;
  provider: string;
  model: string;
  /** Tool calls from this turn that require user approval before being executed. */
  pendingToolCalls?: AnyToolCall[];
  /** tool_result messages + follow-up assistant message to append to client history. */
  toolMessages?: ChatMessage[];
}

// Sent to resolve-proposals endpoint
export interface ResolveProposalsRequest {
  resolutions: ToolCallResolution[];
  messages: ChatMessage[];
  modeId: string;
  contextFileIds: string[];
  settings?: {
    provider?: string;
    model?: string;
    apiKey?: string;
    serverUrl?: string;
  };
}

// Runtime settings (safe — no API keys in response)
export interface Settings {
  provider: string;
  model: string;
  serverUrl?: string;
}

// LLM request to provider
export interface LLMRequest {
  messages: ChatMessage[];
  model: string;
}

// LLM response from provider
export interface LLMResponse {
  content: string;
  toolCalls?: FileProposal[];
}
