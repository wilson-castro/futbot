"use client";

import { useEffect, useRef } from "react";

import { MessageBubble } from "@/components/chat/MessageBubble";
import type { Message } from "@/types/chat";

interface MessageListProps {
  messages: Message[];
  isConnected: boolean;
}

export function MessageList({
  messages,
  isConnected
}: Readonly<MessageListProps>) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-center text-sm text-[#FCFCFC]/60">
          {isConnected
            ? "Comece a conversa com FutBot sobre futebol..."
            : "Aguardando conexão com o servidor..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-end gap-4 overflow-y-auto p-8">
      {messages.map((message) =>
        message.sender === "user" ? (
          <MessageBubble key={message.id} message={message} />
        ) : (
          <div
            key={message.id}
            className="flex w-full flex-col items-start gap-[10px]"
          >
            <MessageBubble message={message} />
          </div>
        )
      )}
      <div ref={bottomRef} />
    </div>
  );
}
