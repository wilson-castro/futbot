import type { Message } from "@/types/chat";

export interface ServerPayload {
  type: string;
  content?: string;
  message?: string;
}

export function parseServerPayload(raw: string): ServerPayload | null {
  try {
    return JSON.parse(raw) as ServerPayload;
  } catch {
    return null;
  }
}

export function appendToken(messages: Message[], token: string, targetId: string): Message[] {
  const last = messages.at(-1);
  if (last?.sender === "bot" && last.id === targetId) {
    return [...messages.slice(0, -1), { ...last, text: last.text + token }];
  }
  return messages;
}

export function setMessageText(messages: Message[], text: string, targetId: string): Message[] {
  const last = messages.at(-1);
  if (last?.sender === "bot" && last.id === targetId) {
    return [...messages.slice(0, -1), { ...last, text }];
  }
  return messages;
}

export function markError(messages: Message[], errorText: string, targetId: string): Message[] {
  const last = messages.at(-1);
  if (last?.id === targetId) {
    return [...messages.slice(0, -1), { ...last, text: errorText, isError: true }];
  }
  return messages;
}

export function markInterrupted(messages: Message[], targetId: string): Message[] {
  const last = messages.at(-1);
  if (last?.id === targetId) {
    const text = last.text || "Conexão interrompida.";
    return [...messages.slice(0, -1), { ...last, text, isError: true }];
  }
  return messages;
}
