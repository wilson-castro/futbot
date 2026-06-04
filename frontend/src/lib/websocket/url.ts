const DEFAULT_WS_PATH = "/v1/ws/chat";
const LOCAL_BACKEND_PORT = "8001";

function resolvePort(hostname: string, windowPort: string): string {
  const customPort = process.env.NEXT_PUBLIC_WS_PORT;
  if (customPort) return customPort;

  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  return isLocalhost ? LOCAL_BACKEND_PORT : windowPort;
}

export function getWebSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }

  const { protocol, hostname, port } = globalThis.location;
  const wsProtocol = protocol === "https:" ? "wss:" : "ws:";

  const host = process.env.NEXT_PUBLIC_WS_HOST ?? hostname;
  const resolvedPort = resolvePort(host, port);
  const wsPort = resolvedPort ? `:${resolvedPort}` : "";
  const path = process.env.NEXT_PUBLIC_WS_PATH ?? DEFAULT_WS_PATH;

  return `${wsProtocol}//${host}${wsPort}${path}`;
}
