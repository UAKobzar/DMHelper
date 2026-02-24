import React from "react";
import { Mode } from "@dmhelper/shared";
import { Select } from "../ui/Select";
import { Label } from "../ui/Label";

interface ModeSelectorProps {
  modes: Mode[];
  activeModeId: string | null;
  onSelectMode: (modeId: string) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  modes,
  activeModeId,
  onSelectMode,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="mode-select">DM Mode</Label>
      <Select
        id="mode-select"
        value={activeModeId || ""}
        onChange={(e) => onSelectMode(e.target.value)}
      >
        <option value="">Select a mode...</option>
        {modes.map((mode) => (
          <option key={mode.id} value={mode.id}>
            {mode.name}
          </option>
        ))}
      </Select>
      {activeModeId && (
        <p className="text-xs text-gray-500">
          {modes.find((m) => m.id === activeModeId)?.description}
        </p>
      )}
    </div>
  );
};
