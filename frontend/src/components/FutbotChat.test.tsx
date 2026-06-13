import { render, screen } from "@testing-library/react";

import type { UseWebSocketReturn } from "@/hooks/useWebSocket";

import FutbotChat from "./FutbotChat";

const mockUseWebSocket = jest.fn<UseWebSocketReturn, []>();

jest.mock("@/hooks/useWebSocket", () => ({
  useWebSocket: () => mockUseWebSocket(),
}));

// Evita dependência de react-markdown (ESM) via MessageBubble.
jest.mock("@/components/chat/MessageList", () => ({
  MessageList: ({ messages }: { messages: unknown[] }) => (
    <div data-testid="message-list">{messages.length} mensagens</div>
  ),
}));

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

describe("FutbotChat", () => {
  it("habilita o input quando conectado e sem carregamento", () => {
    mockUseWebSocket.mockReturnValue({
      messages: [],
      isLoading: false,
      status: "connected",
      sendMessage: jest.fn(),
    });

    render(<FutbotChat />);

    expect(screen.getByText("Conectado com sucesso")).toBeInTheDocument();
    expect(screen.getByLabelText("Mensagem")).toBeEnabled();
  });

  it("desabilita o input quando não conectado", () => {
    mockUseWebSocket.mockReturnValue({
      messages: [],
      isLoading: false,
      status: "connecting",
      sendMessage: jest.fn(),
    });

    render(<FutbotChat />);

    expect(screen.getByLabelText("Mensagem")).toBeDisabled();
  });
});
