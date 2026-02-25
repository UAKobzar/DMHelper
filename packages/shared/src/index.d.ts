export interface Mode {
    id: string;
    name: string;
    description: string;
}
export interface DataFile {
    id: string;
    filename: string;
}
export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}
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
export interface ChatResponse {
    content: string;
    provider: string;
    model: string;
}
export interface Settings {
    provider: string;
    model: string;
    serverUrl?: string;
}
export interface LLMRequest {
    messages: ChatMessage[];
    model: string;
}
export interface LLMResponse {
    content: string;
}
