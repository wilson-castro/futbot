import { getWebSocketUrl } from "./url";

const WS_ENV_KEYS = [
  "NEXT_PUBLIC_WS_URL",
  "NEXT_PUBLIC_WS_HOST",
  "NEXT_PUBLIC_WS_PORT",
  "NEXT_PUBLIC_WS_PATH",
] as const;

function setLocation(loc: { protocol: string; hostname: string; port: string }) {
  Object.defineProperty(globalThis, "location", {
    value: loc,
    configurable: true,
    writable: true,
  });
}

describe("getWebSocketUrl", () => {
  beforeEach(() => {
    for (const key of WS_ENV_KEYS) delete process.env[key];
  });

  it("retorna NEXT_PUBLIC_WS_URL verbatim quando definido", () => {
    process.env.NEXT_PUBLIC_WS_URL = "ws://127.0.0.1:8001/v1/chat";
    expect(getWebSocketUrl()).toBe("ws://127.0.0.1:8001/v1/chat");
  });

  it("usa porta local 8001 e protocolo ws em localhost", () => {
    setLocation({ protocol: "http:", hostname: "localhost", port: "3000" });
    expect(getWebSocketUrl()).toBe("ws://localhost:8001/v1/ws/chat");
  });

  it("usa wss e a porta da janela em host remoto sob https", () => {
    setLocation({ protocol: "https:", hostname: "futbot.app", port: "8443" });
    expect(getWebSocketUrl()).toBe("wss://futbot.app:8443/v1/ws/chat");
  });

  it("respeita overrides granulares de host, porta e path", () => {
    setLocation({ protocol: "http:", hostname: "localhost", port: "3000" });
    process.env.NEXT_PUBLIC_WS_HOST = "api.example.com";
    process.env.NEXT_PUBLIC_WS_PORT = "9000";
    process.env.NEXT_PUBLIC_WS_PATH = "/custom/ws";
    expect(getWebSocketUrl()).toBe("ws://api.example.com:9000/custom/ws");
  });
});
