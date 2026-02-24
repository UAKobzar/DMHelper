import { Mode, DataFile, ChatRequest, ChatResponse, Settings } from "@dmhelper/shared";

const API_BASE = "/api";

export const apiClient = {
  async getModes(): Promise<Mode[]> {
    const res = await fetch(`${API_BASE}/modes`);
    return res.json();
  },

  async getDataFiles(): Promise<DataFile[]> {
    const res = await fetch(`${API_BASE}/data`);
    return res.json();
  },

  async getDataFileContent(filename: string): Promise<string> {
    const res = await fetch(`${API_BASE}/data/${filename}`);
    return res.text();
  },

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Chat failed");
    }

    return res.json();
  },

  async getSettings(): Promise<Settings> {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    return res.json();
  },
};
