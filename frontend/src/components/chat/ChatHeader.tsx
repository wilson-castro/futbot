import type { ConnectionStatus } from "@/types/chat";

const CONNECTION_CONFIG: Record<
  ConnectionStatus,
  { dotClass: string; label: string }
> = {
  connected: { dotClass: "bg-[#21C834]", label: "Conectado com sucesso" },
  connecting: { dotClass: "bg-[#FFCD07]", label: "Conectando..." },
  error: { dotClass: "bg-[#FF8D7B]", label: "Erro na conexão com o servidor" }
};

interface ChatHeaderProps {
  status: ConnectionStatus;
}

export function ChatHeader({ status }: Readonly<ChatHeaderProps>) {
  const { dotClass, label } = CONNECTION_CONFIG[status];

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-[#71767A] px-8 py-6">
      <h1 className="text-[20.16px] font-semibold leading-6 tracking-[0.15px] text-[#FCFCFC]">
        FutBot
      </h1>
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 shrink-0 rounded-full ${dotClass}`} />
        <span className="text-xs text-[#FCFCFC]">{label}</span>
      </div>
    </header>
  );
}
