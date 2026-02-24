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

// Chat message
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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
}
