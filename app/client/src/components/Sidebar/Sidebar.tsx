import React, { useEffect } from "react";
import { useAppStore } from "../../store/appStore";
import { Button } from "../ui/Button";
import { ModeSelector } from "./ModeSelector";
import { ContextFileList } from "./ContextFileList";

interface SidebarProps {
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSettings }) => {
  const {
    modes,
    dataFiles,
    activeModeId,
    selectedFileIds,
    loadModes,
    loadDataFiles,
    setActiveModeId,
    toggleFileSelection,
    clearMessages,
  } = useAppStore();

  useEffect(() => {
    loadModes();
    loadDataFiles();
  }, [loadModes, loadDataFiles]);

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-6 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">DM Helper</h1>
        <p className="text-sm text-gray-500">D&D Assistant</p>
      </div>

      <ModeSelector
        modes={modes}
        activeModeId={activeModeId}
        onSelectMode={setActiveModeId}
      />

      <ContextFileList
        files={dataFiles}
        selectedFileIds={selectedFileIds}
        onToggleFile={toggleFileSelection}
      />

      <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
        <Button
          onClick={clearMessages}
          variant="outline"
          className="w-full"
        >
          New Chat
        </Button>
        <Button
          onClick={onOpenSettings}
          variant="outline"
          className="w-full"
        >
          Settings
        </Button>
      </div>
    </div>
  );
};
