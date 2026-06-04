export type ConnectionStatus = "connecting" | "connected" | "error";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  isError?: boolean;
}
