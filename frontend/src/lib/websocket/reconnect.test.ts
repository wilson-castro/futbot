import { getReconnectDelay } from "./reconnect";

describe("getReconnectDelay", () => {
  it("usa backoff exponencial a partir de 1s", () => {
    expect(getReconnectDelay(0)).toBe(1_000);
    expect(getReconnectDelay(1)).toBe(2_000);
    expect(getReconnectDelay(2)).toBe(4_000);
    expect(getReconnectDelay(3)).toBe(8_000);
  });

  it("limita o atraso máximo em 30s", () => {
    expect(getReconnectDelay(10)).toBe(30_000);
    expect(getReconnectDelay(100)).toBe(30_000);
  });
});
