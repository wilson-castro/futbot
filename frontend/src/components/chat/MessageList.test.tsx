import { render, screen } from "@testing-library/react";

import type { Message } from "@/types/chat";

import { MessageList } from "./MessageList";

// MessageBubble depende de react-markdown (ESM); mockamos o filho.
jest.mock("./MessageBubble", () => ({
  MessageBubble: ({ message }: { message: Message }) => (
    <div data-testid="bubble">{message.text}</div>
  ),
}));

beforeAll(() => {
  // jsdom não implementa scrollIntoView
  Element.prototype.scrollIntoView = jest.fn();
});

describe("MessageList", () => {
  it("mostra o estado vazio conectado", () => {
    render(<MessageList messages={[]} isConnected />);
    expect(
      screen.getByText("Comece a conversa com FutBot sobre futebol...")
    ).toBeInTheDocument();
  });

  it("mostra o estado vazio desconectado", () => {
    render(<MessageList messages={[]} isConnected={false} />);
    expect(
      screen.getByText("Aguardando conexão com o servidor...")
    ).toBeInTheDocument();
  });

  it("renderiza uma bolha por mensagem", () => {
    const messages: Message[] = [
      { id: "u1", text: "oi", sender: "user" },
      { id: "b1", text: "olá!", sender: "bot" },
    ];
    render(<MessageList messages={messages} isConnected />);
    const bubbles = screen.getAllByTestId("bubble");
    expect(bubbles).toHaveLength(2);
    expect(bubbles[0]).toHaveTextContent("oi");
    expect(bubbles[1]).toHaveTextContent("olá!");
  });
});
