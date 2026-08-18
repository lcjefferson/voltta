"use client";

import { FormEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CreditCard,
  MessageCircle,
  Timer,
  TriangleAlert,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { businessTypeLabel } from "@/lib/business-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyPanel, PageTitle } from "@/components/app-page";
import { Input } from "@/components/ui/input";
import { ListPagination } from "@/components/list-pagination";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

type Overview = {
  total: number;
  trialing: number;
  trialExpired: number;
  expiringSoon: number;
  active: number;
  pastDue: number;
  canceled: number;
  suspended: number;
  whatsappConnected: number;
};

type Tenant = {
  id: string;
  name: string;
  slug: string;
  businessType: string;
  status: string;
  trialEndsAt: string;
  trialDaysLeft: number;
  billingLabel: string;
  createdAt: string;
  admin: { name: string; email: string } | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  whatsappConnected: boolean;
  counts: { users: number; customers: number; appointments: number };
};

type TenantsResponse = {
  data: Tenant[];
  total: number;
  page: number;
  limit: number;
};

const buckets = [
  { id: "", label: "Todas" },
  { id: "trialing", label: "Trial" },
  { id: "expiring_soon", label: "Trial acabando" },
  { id: "trial_expired", label: "Trial expirado" },
  { id: "active", label: "Em dia" },
  { id: "past_due", label: "Inadimplente" },
  { id: "canceled", label: "Cancelado" },
  { id: "suspended", label: "Suspenso" },
] as const;

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}

function statusClass(status: string, trialDaysLeft: number) {
  if (status === "TRIALING" && trialDaysLeft < 0) {
    return "bg-red-50 text-red-700";
  }
  if (status === "ACTIVE") return "bg-emerald-50 text-emerald-800";
  if (status === "PAST_DUE" || status === "SUSPENDED") {
    return "bg-red-50 text-red-700";
  }
  if (status === "CANCELED") return "bg-neutral-100 text-neutral-600";
  return undefined;
}

export default function AdminPage() {
  const platformAdmin = useAuthStore((s) => s.user?.platformAdmin);
  const [bucket, setBucket] = useState("");
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");

  const overview = useQuery({
    queryKey: ["platform-overview"],
    queryFn: () => api<Overview>("/platform/overview"),
    retry: false,
    enabled: Boolean(platformAdmin),
  });

  const tenants = useQuery({
    queryKey: ["platform-tenants", page, bucket, appliedQ],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (bucket) params.set("bucket", bucket);
      if (appliedQ) params.set("q", appliedQ);
      return api<TenantsResponse>(`/platform/tenants?${params.toString()}`);
    },
    retry: false,
    enabled: Boolean(platformAdmin),
  });

  function search(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setAppliedQ(q.trim());
  }

  const forbidden = platformAdmin === false;

  const cards = useMemo(() => {
    const d = overview.data;
    if (!d) return [];
    return [
      [Building2, "Contas", d.total, "Empresas cadastradas"],
      [Timer, "Em trial", d.trialing, `${d.expiringSoon} acabam em 3 dias`],
      [CreditCard, "Em dia", d.active, "Assinatura Stripe ativa"],
      [TriangleAlert, "Atenção", d.trialExpired + d.pastDue, "Expirado ou inadimplente"],
      [MessageCircle, "WhatsApp", d.whatsappConnected, "Instâncias conectadas"],
      [Users, "Inadimplente", d.pastDue, `${d.canceled} canceladas`],
    ] as const;
  }, [overview.data]);

  if (platformAdmin === undefined) {
    return (
      <div className="py-16 text-sm text-neutral-500">Validando acesso...</div>
    );
  }

  if (forbidden) {
    return (
      <EmptyPanel
        title="Acesso restrito"
        text="Esta área é só para operação da VOLTTA. O e-mail da sua conta precisa estar em PLATFORM_ADMIN_EMAILS."
      />
    );
  }

  return (
    <>
      <PageTitle eyebrow="OPERAÇÃO" title="CONTAS VOLTTA" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([Icon, label, value, note]) => (
          <Card key={label}>
            <Icon className="size-5 text-[#a58450]" />
            <p className="mt-4 text-sm text-neutral-500">{label}</p>
            <p className="mt-1 font-display text-4xl">{value}</p>
            <p className="mt-2 text-xs text-neutral-500">{note}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-bold">Tenants</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Trial, assinatura Stripe e uso de cada negócio.
            </p>
          </div>
          <form className="flex w-full gap-2 lg:max-w-sm" onSubmit={search}>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar nome, slug ou e-mail"
            />
            <Button type="submit" className="shrink-0 px-4">
              Buscar
            </Button>
          </form>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {buckets.map((item) => (
            <button
              key={item.id || "all"}
              type="button"
              onClick={() => {
                setBucket(item.id);
                setPage(1);
              }}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold transition",
                bucket === item.id
                  ? "bg-[#171715] text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b text-xs tracking-wide text-neutral-500">
              <tr>
                <th className="py-3 pr-4 font-medium">Negócio</th>
                <th className="py-3 pr-4 font-medium">Admin</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Stripe</th>
                <th className="py-3 pr-4 font-medium">WhatsApp</th>
                <th className="py-3 pr-4 font-medium">Uso</th>
                <th className="py-3 font-medium">Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(tenants.data?.data || []).map((tenant) => (
                <tr key={tenant.id}>
                  <td className="py-3 pr-4">
                    <p className="font-bold">{tenant.name}</p>
                    <p className="text-xs text-neutral-500">
                      {businessTypeLabel(tenant.businessType)} · /{tenant.slug}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <p>{tenant.admin?.name || "—"}</p>
                    <p className="text-xs text-neutral-500">
                      {tenant.admin?.email || "Sem admin"}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge
                      className={statusClass(
                        tenant.status,
                        tenant.trialDaysLeft,
                      )}
                    >
                      {tenant.billingLabel}
                    </Badge>
                    {tenant.status === "TRIALING" ? (
                      <p className="mt-1 text-xs text-neutral-500">
                        até {formatDate(tenant.trialEndsAt)}
                      </p>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4">
                    {tenant.subscriptionStatus || "Sem checkout"}
                    {tenant.currentPeriodEnd ? (
                      <p className="text-xs text-neutral-500">
                        até {formatDate(tenant.currentPeriodEnd)}
                      </p>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4">
                    {tenant.whatsappConnected ? "Conectado" : "Off"}
                  </td>
                  <td className="py-3 pr-4 text-neutral-600">
                    {tenant.counts.customers} clientes ·{" "}
                    {tenant.counts.appointments} agend.
                  </td>
                  <td className="py-3 text-neutral-500">
                    {formatDate(tenant.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tenants.isLoading ? (
            <p className="py-8 text-sm text-neutral-500">Carregando contas...</p>
          ) : null}
          {!tenants.isLoading && (tenants.data?.data.length || 0) === 0 ? (
            <p className="py-8 text-sm text-neutral-500">
              Nenhuma conta neste filtro.
            </p>
          ) : null}
        </div>

        <ListPagination
          page={page}
          limit={PAGE_SIZE}
          total={tenants.data?.total || 0}
          onPageChange={setPage}
          noun="contas"
        />
      </Card>
    </>
  );
}
