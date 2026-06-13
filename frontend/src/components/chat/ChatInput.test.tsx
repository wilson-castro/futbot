import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ChatInput } from "./ChatInput";

function setup(overrides: Partial<React.ComponentProps<typeof ChatInput>> = {}) {
  const onSend = jest.fn();
  const props = {
    onSend,
    disabled: false,
    isLoading: false,
    isConnected: true,
    ...overrides,
  };
  render(<ChatInput {...props} />);
  return { onSend };
}

describe("ChatInput", () => {
  it("envia o texto sem espaços nas bordas e limpa o input", async () => {
    const user = userEvent.setup();
    const { onSend } = setup();

    const input = screen.getByLabelText("Mensagem") as HTMLInputElement;
    await user.type(input, "  olá futebol  ");
    await user.click(screen.getByLabelText("Enviar mensagem"));

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith("olá futebol");
    expect(input.value).toBe("");
  });

  it("não envia quando o texto é apenas espaços", async () => {
    const user = userEvent.setup();
    const { onSend } = setup();

    await user.type(screen.getByLabelText("Mensagem"), "    ");
    // botão fica desabilitado; clicar não dispara onSend
    await user.click(screen.getByLabelText("Enviar mensagem"));

    expect(onSend).not.toHaveBeenCalled();
  });

  it("desabilita input e botão quando disabled é true", () => {
    setup({ disabled: true, isConnected: false });
    expect(screen.getByLabelText("Mensagem")).toBeDisabled();
    expect(screen.getByLabelText("Enviar mensagem")).toBeDisabled();
  });

  it("mostra placeholder conforme o estado de conexão/carregamento", () => {
    const { rerender } = render(
      <ChatInput
        onSend={jest.fn()}
        disabled
        isLoading={false}
        isConnected={false}
      />
    );
    expect(
      screen.getByPlaceholderText("Aguardando conexão...")
    ).toBeInTheDocument();

    rerender(
      <ChatInput onSend={jest.fn()} disabled isLoading isConnected />
    );
    expect(
      screen.getByPlaceholderText("Aguardando resposta...")
    ).toBeInTheDocument();

    rerender(
      <ChatInput
        onSend={jest.fn()}
        disabled={false}
        isLoading={false}
        isConnected
      />
    );
    expect(
      screen.getByPlaceholderText("Pergunte alguma coisa sobre futebol")
    ).toBeInTheDocument();
  });
});
