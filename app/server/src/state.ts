import { Settings } from "@dmhelper/shared";
import { config } from "./config";

export interface AppState {
  settings: Settings;
}

export const state: AppState = {
  settings: {
    provider: config.LLM_PROVIDER,
    model: config.LLM_MODEL,
    serverUrl: undefined,
  },
};

export function updateSettings(newSettings: Partial<Settings>) {
  state.settings = {
    ...state.settings,
    ...newSettings,
  };
}

export function getSettings(): Settings {
  return { ...state.settings };
}
