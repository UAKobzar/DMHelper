import { create } from "zustand";
import { ChatMessage, Mode, DataFile, Settings } from "@dmhelper/shared";
import { apiClient } from "../api/client";

export interface AppStore {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  modes: Mode[];
  dataFiles: DataFile[];
  activeModeId: string | null;
  selectedFileIds: string[];
  settings: Settings | null;
  error: string | null;

  // Actions
  loadModes: () => Promise<void>;
  loadDataFiles: () => Promise<void>;
  loadSettings: () => Promise<void>;
  setActiveModeId: (modeId: string) => void;
  toggleFileSelection: (fileId: string) => void;
  clearSelectedFiles: () => void;
  sendMessage: (content: string) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  clearMessages: () => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  messages: [],
  isLoading: false,
  modes: [],
  dataFiles: [],
  activeModeId: null,
  selectedFileIds: [],
  settings: null,
  error: null,

  loadModes: async () => {
    try {
      const modes = await apiClient.getModes();
      set({ modes, error: null });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load modes" });
    }
  },

  loadDataFiles: async () => {
    try {
      const dataFiles = await apiClient.getDataFiles();
      set({ dataFiles, error: null });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load data files" });
    }
  },

  loadSettings: async () => {
    try {
      const settings = await apiClient.getSettings();
      set({ settings, error: null });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load settings" });
    }
  },

  setActiveModeId: (modeId) => {
    set({ activeModeId: modeId });
  },

  toggleFileSelection: (fileId) => {
    set((state) => ({
      selectedFileIds: state.selectedFileIds.includes(fileId)
        ? state.selectedFileIds.filter((id) => id !== fileId)
        : [...state.selectedFileIds, fileId],
    }));
  },

  clearSelectedFiles: () => {
    set({ selectedFileIds: [] });
  },

  sendMessage: async (content) => {
    const state = get();
    if (!state.activeModeId) {
      set({ error: "Select a mode first" });
      return;
    }

    // Add user message
    const userMessage: ChatMessage = { role: "user", content };
    set((s) => ({ messages: [...s.messages, userMessage], isLoading: true, error: null }));

    try {
      const response = await apiClient.chat({
        messages: [...state.messages, userMessage],
        modeId: state.activeModeId,
        contextFileIds: state.selectedFileIds,
      });

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.content,
      };

      set((s) => ({
        messages: [...s.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Chat failed",
      });
    }
  },

  updateSettings: async (newSettings) => {
    try {
      const updated = await apiClient.updateSettings(newSettings);
      set({ settings: updated, error: null });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update settings" });
    }
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  setError: (error) => {
    set({ error });
  },
}));
