import React from "react";
import Markdown from "react-markdown";
import clsx from "clsx";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  role,
  content,
}) => {
  const isUser = role === "user";

  return (
    <div className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-md rounded-lg px-4 py-2",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-900"
        )}
      >
        {isUser ? (
          <p className="text-sm">{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none">
            <Markdown>{content}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
};
