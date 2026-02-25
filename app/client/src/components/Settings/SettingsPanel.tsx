import React from "react";
import { Settings } from "@dmhelper/shared";
import { SettingsForm } from "./SettingsForm";
import { Button } from "../ui/Button";

interface SettingsPanelProps {
  settings: Settings | null;
  onSave: (settings: Partial<Settings>) => Promise<void>;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSave,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold dark:text-gray-50">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>
        <SettingsForm
          settings={settings}
          onSave={async (data) => {
            await onSave(data);
            onClose();
          }}
        />
      </div>
    </div>
  );
};
