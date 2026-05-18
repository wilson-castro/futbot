"use client";

import React, { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function FutbotChat(): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const websocketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const currentMessageIdRef = useRef<string | null>(null);

  // Scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Obter URL do WebSocket (do env ou construir)
  const getWebSocketUrl = (): string => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_WS_URL) {
      return process.env.NEXT_PUBLIC_WS_URL;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;

    // Em desenvolvimento local (localhost / 127.0.0.1) o backend roda na porta 8001.
    // Em produção, quando o frontend e backend estão no mesmo host, não adicionamos porta.
    let port = "";
    if (host === "localhost" || host === "127.0.0.1") {
      port = ":8001";
    } else if (window.location.port) {
      port = `:${window.location.port}`;
    }

    return `${protocol}//${host}${port}/v1/ws/chat`;
  };

  // Conectar ao WebSocket com reconexão automática
  const connectWebSocket = () => {
    try {
      const wsUrl = getWebSocketUrl();
      console.log("🔗 Conectando ao WebSocket:", wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("✅ WebSocket conectado");
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "token") {
            // Adicionar token à última mensagem do bot
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (
                lastMessage &&
                lastMessage.sender === "bot" &&
                lastMessage.id === currentMessageIdRef.current
              ) {
                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastMessage,
                    text: lastMessage.text + data.content
                  }
                ];
              }
              return prev;
            });
          } else if (data.type === "done") {
            console.log("✅ Resposta completa");
            setIsLoading(false);
            currentMessageIdRef.current = null;
          } else if (data.type === "error") {
            console.error("❌ Erro do servidor:", data.message);
            setMessages((prev) => [
              ...prev,
              {
                id: `error-${Date.now()}`,
                text: `Erro: ${data.message}`,
                sender: "bot",
                timestamp: new Date()
              }
            ]);
            setIsLoading(false);
            currentMessageIdRef.current = null;
          }
        } catch (error) {
          console.error("❌ Erro ao processar mensagem:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ Erro WebSocket:", error);
        const errorMsg = "Erro na conexão com o servidor";
        setConnectionError(errorMsg);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("🔌 WebSocket desconectado");
        setIsConnected(false);
        websocketRef.current = null;

        // Reconexão automática com backoff exponencial
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttemptsRef.current),
          30000
        );
        reconnectAttemptsRef.current += 1;
        console.log(
          `⏳ Tentando reconectar em ${delay}ms (tentativa ${reconnectAttemptsRef.current})`
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, delay);
      };

      websocketRef.current = ws;
    } catch (error) {
      console.error("❌ Erro ao conectar:", error);
      const errorMsg = "Erro ao conectar ao servidor";
      setConnectionError(errorMsg);
      setIsConnected(false);
    }
  };

  // Conectar ao iniciar e limpar ao desmontar
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.close();
      }
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !websocketRef.current || !isConnected || isLoading) {
      return;
    }

    // Salvar mensagem em variável local para evitar problemas de timing
    const messageText = input.trim();

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: messageText,
      sender: "user",
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);

    // Adicionar placeholder para resposta do bot
    const botMessageId = `bot-${Date.now()}`;
    const botMessage: Message = {
      id: botMessageId,
      text: "",
      sender: "bot",
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, botMessage]);
    setInput("");
    setIsLoading(true);
    currentMessageIdRef.current = botMessageId;

    // Enviar mensagem via WebSocket (apenas o texto)
    try {
      websocketRef.current.send(messageText);
      console.log("📤 Mensagem enviada:", messageText);
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          text: "Erro ao enviar mensagem. Verifique a conexão.",
          sender: "bot",
          timestamp: new Date()
        }
      ]);
      setIsLoading(false);
      currentMessageIdRef.current = null;
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-6">
      <section className="flex h-[600px] w-full max-w-2xl flex-col rounded-lg border border-neutral-800 bg-neutral-900/60 p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">FutBot</h1>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full transition-colors ${
                  isConnected
                    ? "bg-green-500"
                    : connectionError
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }`}
                title={
                  isConnected ? "Conectado" : connectionError || "Conectando..."
                }
              />
              <span className="text-xs text-neutral-400">
                {isConnected
                  ? "🟢 Conectado"
                  : connectionError
                    ? `🔴 ${connectionError}`
                    : "🟡 Conectando..."}
              </span>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="mb-4 flex-1 space-y-4 overflow-y-auto rounded-md bg-neutral-800/30 p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-sm text-neutral-400">
                {isConnected
                  ? "Comece a conversa com FutBot sobre futebol..."
                  : "Aguardando conexão com o servidor..."}
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs break-words rounded-lg px-4 py-2 lg:max-w-md ${
                      message.sender === "user"
                        ? "bg-blue-600 text-white"
                        : message.id.startsWith("error-")
                          ? "bg-red-900/40 text-red-100"
                          : "bg-neutral-700 text-neutral-100"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-neutral-700 px-4 py-2 text-neutral-100">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-neutral-400"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-neutral-400"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!isConnected || isLoading}
            className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder-neutral-500 transition-colors focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={
              !isConnected
                ? connectionError || "Conectando..."
                : isLoading
                  ? "Aguardando resposta..."
                  : "Escreva uma mensagem..."
            }
            aria-label="message"
          />
          <button
            type="submit"
            disabled={!isConnected || isLoading || !input.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-700"
          >
            {isLoading ? "📤 ..." : "📤 Enviar"}
          </button>
        </form>
      </section>
    </main>
  );
}
