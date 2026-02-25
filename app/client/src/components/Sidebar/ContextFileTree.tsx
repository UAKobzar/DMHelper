import React from "react";
import { DataFolder, DataFile, DataTree } from "@dmhelper/shared";
import { Checkbox } from "../ui/Checkbox";
import { Label } from "../ui/Label";

interface ContextFileTreeProps {
  dataTree: DataTree;
  selectedFileIds: string[];
  expandedFolders: Set<string>;
  onToggleFile: (fileId: string) => void;
  onToggleFolder: (folderPath: string) => void;
}

interface FolderNodeProps {
  folder: DataFolder;
  depth: number;
  selectedFileIds: string[];
  expandedFolders: Set<string>;
  onToggleFile: (fileId: string) => void;
  onToggleFolder: (folderPath: string) => void;
}

const FileNode: React.FC<{
  file: DataFile;
  depth: number;
  selected: boolean;
  onToggle: () => void;
}> = ({ file, depth, selected, onToggle }) => (
  <div
    className="flex items-center gap-2 py-0.5"
    style={{ paddingLeft: `${depth * 16}px` }}
  >
    <Checkbox
      id={`file-${file.id}`}
      checked={selected}
      onChange={onToggle}
    />
    <label
      htmlFor={`file-${file.id}`}
      className="text-sm cursor-pointer text-gray-700 dark:text-gray-300"
    >
      {file.filename}
    </label>
  </div>
);

const FolderNode: React.FC<FolderNodeProps> = ({
  folder,
  depth,
  selectedFileIds,
  expandedFolders,
  onToggleFile,
  onToggleFolder,
}) => {
  const isExpanded = expandedFolders.has(folder.path);

  return (
    <div>
      <button
        onClick={() => onToggleFolder(folder.path)}
        className="flex items-center gap-1 py-0.5 w-full text-left text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400"
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        <span className="text-xs w-4 text-center">
          {isExpanded ? "▾" : "▸"}
        </span>
        {folder.name}
      </button>
      {isExpanded && (
        <div>
          {folder.folders.map((sub: DataFolder) => (
            <FolderNode
              key={sub.path}
              folder={sub}
              depth={depth + 1}
              selectedFileIds={selectedFileIds}
              expandedFolders={expandedFolders}
              onToggleFile={onToggleFile}
              onToggleFolder={onToggleFolder}
            />
          ))}
          {folder.files.map((file: DataFile) => (
            <FileNode
              key={file.id}
              file={file}
              depth={depth + 1}
              selected={selectedFileIds.includes(file.id)}
              onToggle={() => onToggleFile(file.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ContextFileTree: React.FC<ContextFileTreeProps> = ({
  dataTree,
  selectedFileIds,
  expandedFolders,
  onToggleFile,
  onToggleFolder,
}) => {
  const hasContent =
    dataTree.worlds.length > 0 || dataTree.rootFiles.length > 0;

  if (!hasContent) return null;

  return (
    <div className="space-y-2">
      <Label>World Context</Label>
      <div className="space-y-0.5 overflow-y-auto">
        {dataTree.worlds.map((world: DataFolder) => (
          <FolderNode
            key={world.path}
            folder={world}
            depth={0}
            selectedFileIds={selectedFileIds}
            expandedFolders={expandedFolders}
            onToggleFile={onToggleFile}
            onToggleFolder={onToggleFolder}
          />
        ))}
        {dataTree.rootFiles.map((file: DataFile) => (
          <FileNode
            key={file.id}
            file={file}
            depth={0}
            selected={selectedFileIds.includes(file.id)}
            onToggle={() => onToggleFile(file.id)}
          />
        ))}
      </div>
    </div>
  );
};
