"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, ExternalLink, Check, Eye, EyeOff, X } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { bookingAbsoluteUrl, bookingPath } from "@/lib/booking-url";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";

type Company = { name: string; slug: string };

const storageKey = (companyId?: string) =>
  `voltta_hide_booking_link_${companyId || "default"}`;

type Props = {
  /** Permite esconder o card (ex.: no dashboard). */
  dismissible?: boolean;
};

export function BookingLinkCard({ dismissible = false }: Props) {
  const user = useAuthStore((s) => s.user);
  const [copied, setCopied] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [ready, setReady] = useState(!dismissible);

  const { data: company } = useQuery({
    queryKey: ["company"],
    queryFn: () => api<Company>("/company"),
  });

  useEffect(() => {
    if (!dismissible) return;
    try {
      setHidden(localStorage.getItem(storageKey(user?.companyId)) === "1");
    } catch {
      setHidden(false);
    }
    setReady(true);
  }, [dismissible, user?.companyId]);

  function hide() {
    setHidden(true);
    try {
      localStorage.setItem(storageKey(user?.companyId), "1");
    } catch {
      /* ignore */
    }
  }

  function show() {
    setHidden(false);
    try {
      localStorage.removeItem(storageKey(user?.companyId));
    } catch {
      /* ignore */
    }
  }

  const slug = company?.slug || user?.companySlug;
  if (!slug) return null;
  if (dismissible && !ready) return null;

  if (dismissible && hidden) {
    return (
      <button
        type="button"
        onClick={show}
        className="flex items-center gap-2 text-sm font-semibold text-[#9b7a44] transition hover:text-[#171715]"
      >
        <Eye className="size-4" />
        Mostrar link público de agendamento
      </button>
    );
  }

  const path = bookingPath(slug);
  const absolute = bookingAbsoluteUrl(slug);

  async function copy() {
    await navigator.clipboard.writeText(absolute);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="relative border-[#c4a574]/40 bg-[#fbf8f2]">
      {dismissible && (
        <Tooltip content="Esconder no dashboard">
          <button
            type="button"
            onClick={hide}
            className="absolute right-3 top-3 rounded-md p-1.5 text-neutral-400 transition hover:bg-black/5 hover:text-neutral-700"
            aria-label="Esconder link público"
          >
            <X className="size-4" />
          </button>
        </Tooltip>
      )}
      <p className="text-xs font-bold tracking-[.18em] text-[#9b7a44]">
        LINK CURTO
      </p>
      <h3 className="mt-1 font-bold">Agendamento online</h3>
      <p className="mt-1 text-sm text-neutral-600">
        Compartilhe no Instagram, bio ou WhatsApp. Formato:{" "}
        <span className="font-mono text-[#9b7a44]">/b/{slug}</span>
      </p>
      <p className="mt-3 break-all rounded-md bg-white px-3 py-2 font-mono text-sm text-neutral-800">
        {absolute}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button type="button" className="w-full sm:w-auto" onClick={copy}>
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
          className="w-full sm:w-auto"
          onClick={() => window.open(path, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink className="mr-2 size-4" /> ABRIR
        </Button>
        {dismissible && (
          <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={hide}>
            <EyeOff className="mr-2 size-4" /> ESCONDER
          </Button>
        )}
      </div>
    </Card>
  );
}
