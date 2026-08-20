"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Repeat2, TriangleAlert, Users } from "lucide-react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTitle } from "@/components/app-page";
import { BookingLinkCard } from "@/components/booking-link-card";

type Dashboard = {
  customersAtRisk: number;
  loyalCustomers: number;
  inactiveCustomers: number;
  monthRevenue: number;
  yearRevenue: number;
  forecastRevenue: number;
  returnRate: number;
  automationRecoveredRevenue: number;
  todayAppointments: number;
};

const fallback: Dashboard = {
  customersAtRisk: 0,
  loyalCustomers: 0,
  inactiveCustomers: 0,
  monthRevenue: 0,
  yearRevenue: 0,
  forecastRevenue: 0,
  returnRate: 0,
  automationRecoveredRevenue: 0,
  todayAppointments: 0,
};

function money(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<Dashboard>("/dashboard"),
    placeholderData: fallback,
  });
  const d = data ?? fallback;
  const metrics = [
    [
      TriangleAlert,
      "Clientes em risco",
      d.customersAtRisk,
      "Precisam de atenção",
    ],
    [
      Users,
      "Clientes fiéis",
      d.loyalCustomers,
      "Classificação FIEL no Score",
    ],
    [
      Repeat2,
      "Taxa de retorno",
      `${Math.round((d.returnRate || 0) * 100)}%`,
      "Últimos 30 dias",
    ],
    [
      CalendarDays,
      "Agenda de hoje",
      d.todayAppointments,
      "Atendimentos do dia",
    ],
  ] as const;

  return (
    <>
      <PageTitle eyebrow="VISÃO GERAL" title="DASHBOARD VOLTTA" />
      <div className="mb-5">
        <BookingLinkCard dismissible />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([Icon, label, value, note]) => (
          <Card key={label}>
            <Icon className="size-5 text-[#a58450]" />
            <p className="mt-5 text-sm text-neutral-500">{label}</p>
            <p className="mt-1 font-display text-[clamp(1.6rem,7vw,2.25rem)] leading-none">
              {value}
            </p>
            <p className="mt-2 text-xs text-neutral-500">{note}</p>
          </Card>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-neutral-500">Receita do mês</p>
              <p className="mt-1 font-display text-[clamp(1.7rem,8vw,3rem)] leading-none break-words">
                {money(d.monthRevenue)}
              </p>
              <p className="mt-3 text-sm text-neutral-500">
                Ano: {money(d.yearRevenue)} · Recuperada por automações:{" "}
                {money(d.automationRecoveredRevenue)}
              </p>
            </div>
            <Badge className="w-fit shrink-0">Score VOLTTA</Badge>
          </div>
        </Card>
        <Card>
          <p className="font-bold">Ação recomendada</p>
          <p className="mt-3 text-sm text-neutral-600">
            {d.customersAtRisk} clientes em risco ou perdidos. Envie campanha
            de recuperação via WhatsApp.
          </p>
          <p className="mt-5 text-xs text-neutral-500">
            Inativos: {d.inactiveCustomers}
          </p>
        </Card>
      </div>
    </>
  );
}
