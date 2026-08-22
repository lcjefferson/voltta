import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Obrigado por se cadastrar",
  description: "Sua conta VOLTTA foi criada. Você entra no sistema em instantes.",
  robots: { index: false, follow: false },
};

export default function ObrigadoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
