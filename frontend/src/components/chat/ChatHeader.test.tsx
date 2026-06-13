import { render, screen } from "@testing-library/react";

import { ChatHeader } from "./ChatHeader";

describe("ChatHeader", () => {
  it("sempre exibe o título FutBot", () => {
    render(<ChatHeader status="connecting" />);
    expect(screen.getByRole("heading", { name: "FutBot" })).toBeInTheDocument();
  });

  it("mostra o rótulo correto para cada status de conexão", () => {
    const { rerender } = render(<ChatHeader status="connected" />);
    expect(screen.getByText("Conectado com sucesso")).toBeInTheDocument();

    rerender(<ChatHeader status="connecting" />);
    expect(screen.getByText("Conectando...")).toBeInTheDocument();

    rerender(<ChatHeader status="error" />);
    expect(
      screen.getByText("Erro na conexão com o servidor")
    ).toBeInTheDocument();
  });
});
