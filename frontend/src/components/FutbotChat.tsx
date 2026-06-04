"use client";

import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageList } from "@/components/chat/MessageList";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function FutbotChat() {
  const { messages, isLoading, status, sendMessage } = useWebSocket();

  const isConnected = status === "connected";

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="flex h-[540px] w-full max-w-[604px] flex-col rounded-lg border border-[#71767A] bg-[#2D2E2F]">
        <ChatHeader status={status} />
        <MessageList messages={messages} isConnected={isConnected} />
        <ChatInput
          onSend={sendMessage}
          disabled={!isConnected || isLoading}
          isLoading={isLoading}
          isConnected={isConnected}
        />
      </section>
    </main>
  );
}
