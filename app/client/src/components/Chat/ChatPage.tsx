import React from "react";
import { useAppStore } from "../../store/appStore";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { ProposalPanel } from "./FileProposalCard";

export const ChatPage: React.FC = () => {
  const { messages, isLoading, sendMessage, pendingToolCalls } = useAppStore();

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      {pendingToolCalls.length > 0 && (
        <ProposalPanel pendingToolCalls={pendingToolCalls} />
      )}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <ChatInput onSend={sendMessage} isLoading={isLoading || pendingToolCalls.length > 0} />
      </div>
    </div>
  );
};
