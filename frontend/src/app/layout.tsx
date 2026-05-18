import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FutBot",
  description: "Chatbot esportivo"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
