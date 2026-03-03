import React, { useState } from "react";
import { FileProposal, ToolCallResolution, AnyToolCall } from "@dmhelper/shared";
import { useAppStore } from "../../store/appStore";

// ── Single proposal card ──────────────────────────────────────────────────────

interface FileProposalCardProps {
  proposal: FileProposal;
  onResolve: (decision: "approved" | "discarded") => void;
}

export const FileProposalCard: React.FC<FileProposalCardProps> = ({ proposal, onResolve }) => {
  const [contentExpanded, setContentExpanded] = useState(false);

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 text-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            proposal.operation === "create"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          }`}
        >
          {proposal.operation === "create" ? "Create" : "Update"}
        </span>
        <code className="text-xs text-gray-700 dark:text-gray-200 font-mono">
          {proposal.fileId}.md
        </code>
      </div>

      {/* Validation error */}
      {proposal.validationError && (
        <div className="px-3 py-2 bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 text-xs">
          Warning: {proposal.validationError}
        </div>
      )}

      {/* Content preview */}
      <div className="p-3">
        {proposal.operation === "create" && proposal.content && (
          <div>
            <button
              onClick={() => setContentExpanded((v) => !v)}
              className="text-xs text-blue-600 dark:text-blue-400 underline mb-2"
            >
              {contentExpanded ? "Hide content" : "Show content"}
            </button>
            {contentExpanded && (
              <pre className="text-xs bg-gray-100 dark:bg-gray-900 rounded p-2 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
                {proposal.content}
              </pre>
            )}
          </div>
        )}

        {proposal.operation === "update" && proposal.edits && (
          <div className="space-y-2">
            {proposal.edits.map((edit, i) => (
              <div key={i} className="rounded overflow-hidden border border-gray-200 dark:border-gray-600">
                <div className="px-2 py-1 bg-red-50 dark:bg-red-900/30 font-mono text-xs text-red-800 dark:text-red-200 whitespace-pre-wrap border-b border-gray-200 dark:border-gray-600">
                  <span className="select-none text-red-500 dark:text-red-400 mr-1">-</span>
                  {edit.search}
                </div>
                <div className="px-2 py-1 bg-green-50 dark:bg-green-900/30 font-mono text-xs text-green-800 dark:text-green-200 whitespace-pre-wrap">
                  <span className="select-none text-green-500 dark:text-green-400 mr-1">+</span>
                  {edit.replace}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-3 pb-3">
        <button
          onClick={() => onResolve("approved")}
          className="px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          Approve
        </button>
        <button
          onClick={() => onResolve("discarded")}
          className="px-3 py-1 text-xs rounded border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium"
        >
          Discard
        </button>
      </div>
    </div>
  );
};

// ── Proposal panel — shown when there are pending tool calls ──────────────────

export const ProposalPanel: React.FC<{ pendingToolCalls: AnyToolCall[] }> = ({
  pendingToolCalls,
}) => {
  const resolveToolCalls = useAppStore((s) => s.resolveToolCalls);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [collected, setCollected] = useState<ToolCallResolution[]>([]);

  const proposals = pendingToolCalls.filter(
    (tc): tc is FileProposal => tc.toolName === "propose_file_change"
  );

  if (!proposals.length) return null;

  const handleResolve = (decision: "approved" | "discarded") => {
    const proposal = proposals[currentIndex];
    const updated = [...collected, { toolCallId: proposal.toolCallId, decision }];

    if (currentIndex + 1 < proposals.length) {
      setCollected(updated);
      setCurrentIndex((i) => i + 1);
    } else {
      // All resolved — submit
      resolveToolCalls(updated);
    }
  };

  const current = proposals[currentIndex];

  return (
    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Proposal {currentIndex + 1} of {proposals.length}
      </div>
      <FileProposalCard proposal={current} onResolve={handleResolve} />
    </div>
  );
};
