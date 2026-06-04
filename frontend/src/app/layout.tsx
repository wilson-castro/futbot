import "./globals.css";

import type { Metadata } from "next";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-roboto",
  display: "swap"
});

export const metadata: Metadata = {
  title: "FutBot",
  description: "Chatbot esportivo"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={roboto.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
