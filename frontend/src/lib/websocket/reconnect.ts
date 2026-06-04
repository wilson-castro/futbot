const BASE_DELAY_MS = 1_000;
const MAX_DELAY_MS = 30_000;

export function getReconnectDelay(attempts: number): number {
  return Math.min(BASE_DELAY_MS * Math.pow(2, attempts), MAX_DELAY_MS);
}
