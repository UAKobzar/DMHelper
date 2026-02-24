import React from "react";
import { useAppStore } from "../../store/appStore";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

export const ChatPage: React.FC = () => {
  const { messages, isLoading, sendMessage } = useAppStore();

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      <div className="border-t border-gray-200 p-4">
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};
