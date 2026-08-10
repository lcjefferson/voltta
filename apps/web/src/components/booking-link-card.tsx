"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, ExternalLink, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Company = { name: string; slug: string };

export function BookingLinkCard() {
  const user = useAuthStore((s) => s.user);
  const [copied, setCopied] = useState(false);

  const { data: company } = useQuery({
    queryKey: ["company"],
    queryFn: () => api<Company>("/company"),
  });

  const slug = company?.slug || user?.companySlug;
  if (!slug) return null;

  const path = `/agendar/${slug}`;
  const absolute =
    typeof window !== "undefined"
      ? `${window.location.origin}${path}`
      : path;

  async function copy() {
    await navigator.clipboard.writeText(absolute);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="border-[#c4a574]/40 bg-[#fbf8f2]">
      <p className="text-xs font-bold tracking-[.18em] text-[#9b7a44]">
        LINK PÚBLICO
      </p>
      <h3 className="mt-1 font-bold">Agendamento online</h3>
      <p className="mt-1 text-sm text-neutral-600">
        Compartilhe no Instagram, bio ou WhatsApp. O cliente marca sozinho.
      </p>
      <p className="mt-3 break-all rounded-md bg-white px-3 py-2 font-mono text-sm text-neutral-800">
        {absolute}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" onClick={copy}>
          {copied ? (
            <>
              <Check className="mr-2 size-4" /> COPIADO
            </>
          ) : (
            <>
              <Copy className="mr-2 size-4" /> COPIAR LINK
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.open(path, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink className="mr-2 size-4" /> ABRIR
        </Button>
      </div>
    </Card>
  );
}
