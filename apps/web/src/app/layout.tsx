import type { Metadata } from "next";
import { DM_Sans, Oswald } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VOLTTA™ | Seu cliente sempre de volta.",
  description:
    "Pare de perder clientes sem perceber. Agenda, WhatsApp automatizado e recuperação de clientes para barbearias.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${dmSans.variable} ${oswald.variable} antialiased`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
