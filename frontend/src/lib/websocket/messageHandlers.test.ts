import type { Message } from "@/types/chat";

import {
  appendToken,
  markError,
  markInterrupted,
  parseServerPayload,
} from "./messageHandlers";

const bot = (id: string, text = ""): Message => ({ id, text, sender: "bot" });
const user = (id: string, text: string): Message => ({ id, text, sender: "user" });

describe("parseServerPayload", () => {
  it("faz parse de JSON válido", () => {
    expect(parseServerPayload('{"type":"token","content":"oi"}')).toEqual({
      type: "token",
      content: "oi",
    });
  });

  it("retorna null para JSON inválido", () => {
    expect(parseServerPayload("não é json")).toBeNull();
  });
});

describe("appendToken", () => {
  it("concatena o token à última mensagem do bot quando o id casa", () => {
    const messages = [user("u1", "oi"), bot("b1", "Olá")];
    const result = appendToken(messages, " mundo", "b1");
    expect(result.at(-1)).toEqual({ id: "b1", text: "Olá mundo", sender: "bot" });
  });

  it("não altera nada quando o id não casa com a última mensagem", () => {
    const messages = [user("u1", "oi"), bot("b1", "Olá")];
    const result = appendToken(messages, " mundo", "b-outro");
    expect(result).toEqual(messages);
  });

  it("não altera quando a última mensagem não é do bot", () => {
    const messages = [bot("b1", "Olá"), user("u1", "oi")];
    expect(appendToken(messages, "x", "u1")).toEqual(messages);
  });
});

describe("markError", () => {
  it("substitui o texto da mensagem alvo e marca isError", () => {
    const messages = [bot("b1", "parcial")];
    const result = markError(messages, "Falhou", "b1");
    expect(result.at(-1)).toEqual({
      id: "b1",
      text: "Falhou",
      sender: "bot",
      isError: true,
    });
  });

  it("não altera quando o id não casa", () => {
    const messages = [bot("b1", "parcial")];
    expect(markError(messages, "Falhou", "outro")).toEqual(messages);
  });
});

describe("markInterrupted", () => {
  it("mantém o texto parcial existente e marca isError", () => {
    const messages = [bot("b1", "resposta parcial")];
    const result = markInterrupted(messages, "b1");
    expect(result.at(-1)).toMatchObject({ text: "resposta parcial", isError: true });
  });

  it("usa texto padrão quando a mensagem estava vazia", () => {
    const messages = [bot("b1", "")];
    const result = markInterrupted(messages, "b1");
    expect(result.at(-1)).toMatchObject({ text: "Conexão interrompida.", isError: true });
  });
});
