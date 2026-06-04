"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  appendToken,
  markError,
  markInterrupted,
  parseServerPayload
} from "@/lib/websocket/messageHandlers";
import { getReconnectDelay } from "@/lib/websocket/reconnect";
import { getWebSocketUrl } from "@/lib/websocket/url";
import type { ConnectionStatus, Message } from "@/types/chat";

export interface UseWebSocketReturn {
  messages: Message[];
  isLoading: boolean;
  status: ConnectionStatus;
  sendMessage: (text: string) => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const currentBotIdRef = useRef<string | null>(null);
  const messageIdRef = useRef(0);

  useEffect(() => {
    let unmounted = false;

    function connect() {
      if (unmounted) return;

      try {
        const ws = new WebSocket(getWebSocketUrl());

        ws.onopen = () => {
          setStatus("connected");
          reconnectAttemptsRef.current = 0;
        };

        ws.onmessage = ({ data }: MessageEvent<string>) => {
          const payload = parseServerPayload(data);
          if (!payload) return;

          const botId = currentBotIdRef.current;

          if (payload.type === "token" && payload.content && botId) {
            setMessages((prev) => appendToken(prev, payload.content!, botId));
          } else if (payload.type === "done") {
            setIsLoading(false);
            currentBotIdRef.current = null;
          } else if (payload.type === "error" && botId) {
            setMessages((prev) =>
              markError(prev, payload.message ?? "Erro desconhecido", botId)
            );
            setIsLoading(false);
            currentBotIdRef.current = null;
          }
        };

        ws.onerror = () => setStatus("error");

        ws.onclose = () => {
          if (unmounted) return;

          setStatus("connecting");
          wsRef.current = null;

          const botId = currentBotIdRef.current;
          if (botId) {
            setMessages((prev) => markInterrupted(prev, botId));
            setIsLoading(false);
            currentBotIdRef.current = null;
          }

          const delay = getReconnectDelay(reconnectAttemptsRef.current);
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        };

        wsRef.current = ws;
      } catch {
        setStatus("error");
      }
    }

    connect();

    return () => {
      unmounted = true;
      clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    const id = ++messageIdRef.current;
    const botId = `bot-${id}`;
    currentBotIdRef.current = botId;

    setMessages((prev) => [
      ...prev,
      { id: `user-${id}`, text, sender: "user" },
      { id: botId, text: "", sender: "bot" }
    ]);
    setIsLoading(true);

    try {
      wsRef.current.send(text);
    } catch {
      setMessages((prev) =>
        markError(prev, "Erro ao enviar mensagem. Verifique a conexão.", botId)
      );
      setIsLoading(false);
      currentBotIdRef.current = null;
    }
  }, []);

  return { messages, isLoading, status, sendMessage };
}
