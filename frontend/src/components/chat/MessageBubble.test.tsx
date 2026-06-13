import { render, screen } from "@testing-library/react";

import type { Message } from "@/types/chat";

import { MessageBubble } from "./MessageBubble";

// react-markdown e remark-gfm são ESM-only; mockamos para um render simples.
jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => (
    <div data-testid="markdown">{children}</div>
  ),
}));
jest.mock("remark-gfm", () => ({ __esModule: true, default: () => undefined }));

const msg = (over: Partial<Message>): Message => ({
  id: "1",
  text: "",
  sender: "bot",
  ...over,
});

describe("MessageBubble", () => {
  it("renderiza mensagem do usuário como texto puro", () => {
    render(<MessageBubble message={msg({ sender: "user", text: "Olá" })} />);
    expect(screen.getByText("Olá")).toBeInTheDocument();
    expect(screen.queryByTestId("markdown")).not.toBeInTheDocument();
  });

  it("renderiza indicador de carregamento quando o texto do bot está vazio", () => {
    const { container } = render(
      <MessageBubble message={msg({ sender: "bot", text: "" })} />
    );
    // três pontos animados
    expect(container.querySelectorAll(".animate-bounce")).toHaveLength(3);
  });

  it("renderiza markdown para mensagem do bot com texto", () => {
    render(
      <MessageBubble message={msg({ sender: "bot", text: "**Gol** do Palmeiras" })} />
    );
    expect(screen.getByTestId("markdown")).toHaveTextContent(
      "**Gol** do Palmeiras"
    );
  });
});
