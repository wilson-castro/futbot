import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-1 text-lg font-black leading-none text-[#FCFCFC]">
      <span className="animate-bounce">.</span>
      <span className="animate-bounce [animation-delay:150ms]">.</span>
      <span className="animate-bounce [animation-delay:300ms]">.</span>
    </span>
  );
}

export function MessageBubble({ message }: Readonly<MessageBubbleProps>) {
  const isUser = message.sender === "user";
  const isLoading = message.text === "";

  return (
    <div
      className={cn(
        "max-w-[405px] rounded-[10px] px-3 py-2 text-sm text-[#FCFCFC]",
        isUser ? "bg-[#15803D]" : "bg-[#6F7070]"
      )}
    >
      {isLoading ? (
        <LoadingDots />
      ) : isUser ? (
        <p className="whitespace-pre-wrap">{message.text}</p>
      ) : (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => (
              <ul className="mb-2 list-disc pl-5">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-2 list-decimal pl-5">{children}</ol>
            ),
            li: ({ children }) => <li className="mb-1">{children}</li>,
            strong: ({ children }) => (
              <strong className="font-semibold">{children}</strong>
            ),
            code: ({ children }) => (
              <code className="rounded bg-black/30 px-1 py-0.5 text-xs">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="my-2 overflow-x-auto rounded bg-black/30 p-3 text-xs">
                {children}
              </pre>
            ),
            a: ({ children, href }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {children}
              </a>
            )
          }}
        >
          {message.text}
        </ReactMarkdown>
      )}
    </div>
  );
}
