import React from "react";
import { DataFile } from "@dmhelper/shared";
import { Checkbox } from "../ui/Checkbox";
import { Label } from "../ui/Label";

interface ContextFileListProps {
  files: DataFile[];
  selectedFileIds: string[];
  onToggleFile: (fileId: string) => void;
}

export const ContextFileList: React.FC<ContextFileListProps> = ({
  files,
  selectedFileIds,
  onToggleFile,
}) => {
  return (
    <div className="space-y-2">
      <Label>World Context</Label>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {files.map((file) => (
          <div key={file.id} className="flex items-center gap-2">
            <Checkbox
              id={`file-${file.id}`}
              checked={selectedFileIds.includes(file.id)}
              onChange={() => onToggleFile(file.id)}
            />
            <label
              htmlFor={`file-${file.id}`}
              className="text-sm cursor-pointer"
            >
              {file.filename}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
