import React from "react";
import Markdown from "react-markdown";
import clsx from "clsx";
import { ChatMessage } from "@dmhelper/shared";

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { role, content, toolCalls, toolCallId } = message;

  if (role === "tool_result") {
    return (
      <div className="flex justify-start">
        <div className="text-xs text-gray-500 dark:text-gray-400 italic px-2 py-1">
          {toolCallId ? `[${toolCallId.slice(0, 8)}] ` : ""}
          {content}
        </div>
      </div>
    );
  }

  const isUser = role === "user";

  return (
    <div className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-md rounded-lg px-4 py-2",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        )}
      >
        {isUser ? (
          <p className="text-sm">{content}</p>
        ) : (
          <>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown>{content}</Markdown>
            </div>
            {toolCalls?.length ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                Proposed {toolCalls.length} file change{toolCalls.length > 1 ? "s" : ""}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};
