"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTitle } from "@/components/app-page";

type Subscription = {
  status?: string;
  currentPeriodEnd?: string | null;
  graceUntil?: string | null;
} | null;

export default function AssinaturaPage() {
  const { data: sub } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => api<Subscription>("/billing/subscription"),
  });

  const checkout = useMutation({
    mutationFn: () =>
      api<{ url: string | null }>("/billing/checkout-session", {
        method: "POST",
        body: JSON.stringify({
          successUrl: `${window.location.origin}/assinatura?ok=1`,
          cancelUrl: `${window.location.origin}/assinatura?cancel=1`,
        }),
      }),
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
      else alert("Configure STRIPE_SECRET_KEY e STRIPE_PRICE_ID no .env da API.");
    },
  });

  const portal = useMutation({
    mutationFn: () =>
      api<{ url: string | null }>("/billing/portal-session", {
        method: "POST",
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/assinatura`,
        }),
      }),
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
      else alert("Portal Stripe indisponível. Complete o checkout primeiro.");
    },
  });

  const status = sub?.status || "TRIALING";

  return (
    <>
      <PageTitle eyebrow="CONTA" title="ASSINATURA" />
      <Card className="max-w-xl border-2 border-[#c4a574]">
        <div className="flex justify-between">
          <div>
            <h2 className="font-display text-3xl">PLANO VOLTTA</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Tudo para trazer seus clientes de volta.
            </p>
          </div>
          <Badge>{status}</Badge>
        </div>
        <p className="mt-8 font-display text-5xl">
          R$79<span className="text-2xl">,90/mês</span>
        </p>
        <ul className="my-7 space-y-3 text-sm">
          {[
            "Clientes ilimitados",
            "Automações de WhatsApp (Uazapi)",
            "Agenda online + link público",
            "Score VOLTTA e relatórios",
          ].map((x) => (
            <li className="flex gap-2" key={x}>
              <Check className="size-4 text-[#a58450]" />
              {x}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <Button disabled={checkout.isPending} onClick={() => checkout.mutate()}>
            {checkout.isPending ? "ABRINDO..." : "IR PARA O CHECKOUT"}
          </Button>
          <Button
            variant="outline"
            disabled={portal.isPending}
            onClick={() => portal.mutate()}
          >
            GERENCIAR ASSINATURA
          </Button>
        </div>
      </Card>
    </>
  );
}
