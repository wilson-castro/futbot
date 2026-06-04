"use client";

import { ChangeEvent, useState } from "react";

const SendIcon = () => (
  <svg
    width="13"
    height="12"
    viewBox="0 0 13 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12.3476 6.51712C12.7188 6.36244 12.9597 5.99783 12.9597 5.59567C12.9597 5.1935 12.7188 4.8289 12.3476 4.67422L1.38743 0.078025C0.945492 -0.10759 0.437259 0.0470892 0.169884 0.442627C-0.0974912 0.838165 -0.0444583 1.3685 0.293627 1.70658L4.18271 5.59567L0.293627 9.48476C-0.0444588 9.82284 -0.0952821 10.351 0.169883 10.7487C0.435048 11.1465 0.945491 11.2989 1.38743 11.1133L12.3476 6.51712Z"
      fill="black"
    />
  </svg>
);

function getPlaceholder(isConnected: boolean, isLoading: boolean): string {
  if (!isConnected) return "Aguardando conexão...";
  if (isLoading) return "Aguardando resposta...";
  return "Pergunte alguma coisa sobre futebol";
}

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
  isLoading: boolean;
  isConnected: boolean;
}

export function ChatInput({
  onSend,
  disabled,
  isLoading,
  isConnected
}: Readonly<ChatInputProps>) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex shrink-0 items-center gap-4 p-6"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder={getPlaceholder(isConnected, isLoading)}
        aria-label="Mensagem"
        className="flex-1 rounded border border-[#71767A] bg-transparent px-4 py-2 text-sm leading-6 tracking-[0.15px] text-[#FCFCFC] placeholder:text-[#FCFCFC]/85 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Enviar mensagem"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#22C55E] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SendIcon />
      </button>
    </form>
  );
}
