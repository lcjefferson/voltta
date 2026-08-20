"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTitle } from "@/components/app-page";
import { Tooltip } from "@/components/ui/tooltip";
import { useFeedback } from "@/providers/feedback-provider";
import { useAuthStore } from "@/lib/auth-store";
import { isTrialExpired } from "@/lib/trial";

type Subscription = {
  status?: string;
  currentPeriodEnd?: string | null;
  graceUntil?: string | null;
  stripeCustomerId?: string | null;
} | null;

type Company = {
  stripeCustomerId?: string | null;
  status?: string;
  trialEndsAt?: string;
};

type Me = {
  trialLocked?: boolean;
  companyStatus?: string;
  trialEndsAt?: string;
  role?: string;
};

export default function AssinaturaPage() {
  const { alert } = useFeedback();
  const queryClient = useQueryClient();
  const { user, patchUser } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const { data: sub } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => api<Subscription>("/billing/subscription"),
  });
  const { data: company } = useQuery({
    queryKey: ["company"],
    queryFn: () => api<Company>("/company"),
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("ok") !== "1") return;
    let cancelled = false;
    api<Me>("/auth/me")
      .then((me) => {
        if (!cancelled) patchUser(me);
      })
      .catch(() => {});
    void queryClient.invalidateQueries({ queryKey: ["company"] });
    void queryClient.invalidateQueries({ queryKey: ["subscription"] });
    return () => {
      cancelled = true;
    };
  }, [patchUser, queryClient]);

  const checkout = useMutation({
    mutationFn: () =>
      api<{ url: string | null; error?: string }>("/billing/checkout-session", {
        method: "POST",
        body: JSON.stringify({
          successUrl: `${window.location.origin}/assinatura?ok=1`,
          cancelUrl: `${window.location.origin}/assinatura?cancel=1`,
        }),
      }),
    onSuccess: async (data) => {
      if (data.url) window.location.href = data.url;
      else
        await alert({
          title: "Checkout indisponível",
          message:
            data.error ||
            "Configure STRIPE_SECRET_KEY (sk_...) e STRIPE_PRICE_ID (price_...) no Coolify da API e faça Deploy.",
        });
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
    onSuccess: async (data) => {
      if (data.url) window.location.href = data.url;
      else
        await alert({
          title: "Portal indisponível",
          message: "Conclua o checkout primeiro.",
        });
    },
  });

  const status = sub?.status || company?.status || "TRIALING";
  const trialLocked =
    !user?.platformAdmin &&
    Boolean(
      user?.trialLocked ||
        isTrialExpired(company?.status, company?.trialEndsAt),
    );
  const canManage = Boolean(company?.stripeCustomerId || sub);
  const errorMessage =
    (portal.error as Error | null)?.message ||
    (checkout.error as Error | null)?.message;

  return (
    <>
      <PageTitle eyebrow="CONTA" title="ASSINATURA" />
      {trialLocked ? (
        <Card className="mb-4 max-w-xl border-2 border-red-200 bg-red-50">
          <p className="font-display text-xl text-red-800">TRIAL ENCERRADO</p>
          <p className="mt-2 text-sm text-red-700">
            {isAdmin
              ? "O período de avaliação acabou. Assine para continuar usando agenda, clientes e automações."
              : "O período de avaliação acabou. Peça ao administrador da conta para assinar e liberar o acesso."}
          </p>
        </Card>
      ) : null}
      <Card className="max-w-xl border-2 border-[#c4a574]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-display text-2xl sm:text-3xl">PLANO VOLTTA</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Tudo para trazer seus clientes de volta.
            </p>
          </div>
          <Badge className="w-fit shrink-0">
            {trialLocked ? "TRIAL EXPIRADO" : status}
          </Badge>
        </div>
        <p className="mt-8 font-display text-[clamp(2rem,10vw,3rem)] leading-none">
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
              <Check className="size-4 shrink-0 text-[#a58450]" />
              {x}
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {isAdmin ? (
            <Button
              className="w-full sm:w-auto"
              disabled={checkout.isPending}
              onClick={() => checkout.mutate()}
            >
              {checkout.isPending
                ? "ABRINDO..."
                : trialLocked
                  ? "ASSINAR AGORA"
                  : "IR PARA O CHECKOUT"}
            </Button>
          ) : null}
          {isAdmin ? (
            <Tooltip
              className="w-full sm:w-auto"
              content={
                canManage
                  ? "Abrir portal Stripe"
                  : "Conclua o checkout antes de gerenciar"
              }
            >
              <Button
                className="w-full sm:w-auto"
                variant="outline"
                disabled={portal.isPending || !canManage}
                onClick={() => portal.mutate()}
              >
                {portal.isPending ? "ABRINDO..." : "GERENCIAR ASSINATURA"}
              </Button>
            </Tooltip>
          ) : null}
        </div>
        {!isAdmin && trialLocked ? (
          <p className="mt-4 text-sm text-neutral-500">
            Somente o administrador da conta consegue concluir a assinatura.
          </p>
        ) : null}
        {isAdmin && !canManage && (
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
