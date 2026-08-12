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
  stripeCustomerId?: string | null;
} | null;

type Company = {
  stripeCustomerId?: string | null;
  status?: string;
};

export default function AssinaturaPage() {
  const { data: sub } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => api<Subscription>("/billing/subscription"),
  });
  const { data: company } = useQuery({
    queryKey: ["company"],
    queryFn: () => api<Company>("/company"),
  });

  const checkout = useMutation({
    mutationFn: () =>
      api<{ url: string | null; error?: string }>("/billing/checkout-session", {
        method: "POST",
        body: JSON.stringify({
          successUrl: `${window.location.origin}/assinatura?ok=1`,
          cancelUrl: `${window.location.origin}/assinatura?cancel=1`,
        }),
      }),
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
      else
        alert(
          data.error ||
            "Configure STRIPE_SECRET_KEY (sk_...) e STRIPE_PRICE_ID (price_...) no Coolify da API e faça Deploy.",
        );
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
      else
        alert(
          "Portal Stripe indisponível. Conclua o checkout primeiro.",
        );
    },
  });

  const status = sub?.status || company?.status || "TRIALING";
  const canManage = Boolean(company?.stripeCustomerId || sub);
  const errorMessage =
    (portal.error as Error | null)?.message ||
    (checkout.error as Error | null)?.message;

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
          <Button
            disabled={checkout.isPending}
            onClick={() => checkout.mutate()}
          >
            {checkout.isPending ? "ABRINDO..." : "IR PARA O CHECKOUT"}
          </Button>
          <Button
            variant="outline"
            disabled={portal.isPending || !canManage}
            onClick={() => portal.mutate()}
            title={
              canManage
                ? "Abrir portal Stripe"
                : "Conclua o checkout antes de gerenciar"
            }
          >
            {portal.isPending ? "ABRINDO..." : "GERENCIAR ASSINATURA"}
          </Button>
        </div>
        {!canManage && (
          <p className="mt-4 text-sm text-neutral-500">
            Para gerenciar cartão ou cancelar, conclua o checkout primeiro.
          </p>
        )}
        {errorMessage && (
          <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
        )}
      </Card>
    </>
  );
}
