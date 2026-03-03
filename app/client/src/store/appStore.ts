import { create } from "zustand";
import { ChatMessage, Mode, DataTree, Settings, AnyToolCall, ToolCallResolution } from "@dmhelper/shared";
import { apiClient } from "../api/client";

export interface AppStore {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  modes: Mode[];
  dataTree: DataTree | null;
  activeModeId: string | null;
  selectedFileIds: string[];
  expandedFolders: Set<string>;
  settings: Settings | null;
  error: string | null;
  pendingToolCalls: AnyToolCall[];

  // Actions
  loadModes: () => Promise<void>;
  loadDataFiles: () => Promise<void>;
  loadSettings: () => Promise<void>;
  setActiveModeId: (modeId: string) => void;
  toggleFileSelection: (fileId: string) => void;
  toggleFolderExpanded: (folderPath: string) => void;
  clearSelectedFiles: () => void;
  sendMessage: (content: string) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  clearMessages: () => void;
  setError: (error: string | null) => void;
  resolveToolCalls: (resolutions: ToolCallResolution[]) => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  messages: [],
  isLoading: false,
  modes: [],
  dataTree: null,
  activeModeId: null,
  selectedFileIds: [],
  expandedFolders: new Set(),
  settings: null,
  error: null,
  pendingToolCalls: [],

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
      const dataTree = await apiClient.getDataFiles();
      set({ dataTree, error: null });
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

  toggleFolderExpanded: (folderPath) => {
    set((state) => {
      const next = new Set(state.expandedFolders);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return { expandedFolders: next };
    });
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

    const userMessage: ChatMessage = { role: "user", content };
    set((s) => ({ messages: [...s.messages, userMessage], isLoading: true, error: null }));

    try {
      const response = await apiClient.chat({
        messages: [...state.messages, userMessage],
        modeId: state.activeModeId,
        contextFileIds: state.selectedFileIds,
      });

      if (response.pendingToolCalls?.length) {
        // Assistant returned tool calls — store them for user resolution
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: response.content,
          toolCalls: response.pendingToolCalls,
        };
        set((s) => ({
          messages: [...s.messages, assistantMessage],
          isLoading: false,
          pendingToolCalls: response.pendingToolCalls!,
        }));
      } else {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: response.content,
        };
        set((s) => ({
          messages: [...s.messages, assistantMessage],
          isLoading: false,
        }));
      }
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Chat failed",
      });
    }
  },

  resolveToolCalls: async (resolutions) => {
    const state = get();
    set({ isLoading: true, pendingToolCalls: [], error: null });
    try {
      const response = await apiClient.resolveProposals({
        resolutions,
        messages: state.messages,
        modeId: state.activeModeId!,
        contextFileIds: state.selectedFileIds,
      });

      // toolMessages contains tool_result messages + follow-up assistant msg
      const newMsgs: ChatMessage[] = response.toolMessages || [];
      // If toolMessages doesn't include an assistant message, add one
      if (!newMsgs.find((m) => m.role === "assistant")) {
        newMsgs.push({
          role: "assistant",
          content: response.content,
          ...(response.pendingToolCalls?.length ? { toolCalls: response.pendingToolCalls } : {}),
        });
      }

      set((s) => ({
        messages: [...s.messages, ...newMsgs],
        isLoading: false,
        pendingToolCalls: response.pendingToolCalls || [],
      }));

      // Reload sidebar if any files were approved
      if (resolutions.some((r) => r.decision === "approved")) {
        await get().loadDataFiles();
      }
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : "Resolve failed" });
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
    set({ messages: [], pendingToolCalls: [] });
  },

  setError: (error) => {
    set({ error });
  },
}));
