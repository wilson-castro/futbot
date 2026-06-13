import { act, renderHook } from "@testing-library/react";

import { useWebSocket } from "./useWebSocket";

class FakeWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 3;
  static instances: FakeWebSocket[] = [];

  url: string;
  readyState = FakeWebSocket.CONNECTING;
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.readyState = FakeWebSocket.CLOSED;
  }

  // Helpers de teste
  open() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.();
  }
  emit(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }
}

const lastSocket = () => FakeWebSocket.instances.at(-1)!;

beforeEach(() => {
  FakeWebSocket.instances = [];
  (globalThis as unknown as { WebSocket: unknown }).WebSocket = FakeWebSocket;
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useWebSocket", () => {
  it("começa em 'connecting' e passa para 'connected' ao abrir", () => {
    const { result } = renderHook(() => useWebSocket());
    expect(result.current.status).toBe("connecting");

    act(() => lastSocket().open());
    expect(result.current.status).toBe("connected");
  });

  it("ao enviar mensagem adiciona bolhas de usuário e bot e marca loading", () => {
    const { result } = renderHook(() => useWebSocket());
    act(() => lastSocket().open());

    act(() => result.current.sendMessage("e aí futbot?"));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toMatchObject({
      sender: "user",
      text: "e aí futbot?",
    });
    expect(result.current.messages[1]).toMatchObject({ sender: "bot", text: "" });
    expect(lastSocket().sent).toEqual(["e aí futbot?"]);
  });

  it("acumula tokens e encerra o loading no 'done'", () => {
    const { result } = renderHook(() => useWebSocket());
    act(() => lastSocket().open());
    act(() => result.current.sendMessage("oi"));

    act(() => lastSocket().emit({ type: "token", content: "Olá " }));
    act(() => lastSocket().emit({ type: "token", content: "torcedor" }));

    expect(result.current.messages.at(-1)?.text).toBe("Olá torcedor");
    expect(result.current.isLoading).toBe(true);

    act(() => lastSocket().emit({ type: "done" }));
    expect(result.current.isLoading).toBe(false);
  });

  it("marca a bolha como erro ao receber type 'error'", () => {
    const { result } = renderHook(() => useWebSocket());
    act(() => lastSocket().open());
    act(() => result.current.sendMessage("oi"));

    act(() =>
      lastSocket().emit({ type: "error", message: "Mensagem bloqueada." })
    );

    expect(result.current.messages.at(-1)).toMatchObject({
      text: "Mensagem bloqueada.",
      isError: true,
    });
    expect(result.current.isLoading).toBe(false);
  });

  it("não envia quando o socket não está aberto", () => {
    const { result } = renderHook(() => useWebSocket());
    // sem chamar open(): readyState continua CONNECTING

    act(() => result.current.sendMessage("oi"));

    expect(result.current.messages).toHaveLength(0);
    expect(lastSocket().sent).toHaveLength(0);
  });
});
