"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageTitle } from "@/components/app-page";

type Summary = {
  monthRevenue: number;
  yearRevenue: number;
  totalRevenue: number;
  avgTicket: number;
  monthTransactions: number;
  recurringCustomers: number;
  recurringRevenue: number;
  byPaymentMethod: { method: string; amount: number; count: number }[];
  topServices: { name: string; amount: number; count: number }[];
};

type Revenue = {
  id: string;
  amount: number | string;
  paymentMethod: string;
  revenueDate: string;
  customer?: { name: string } | null;
  service?: { name: string } | null;
  professional?: { name: string } | null;
};

function money(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const methodLabel: Record<string, string> = {
  PIX: "Pix",
  CASH: "Dinheiro",
  CARD: "Cartão",
  OTHER: "Outro",
};

export default function FinanceiroPage() {
  const qc = useQueryClient();
  const { data: summary } = useQuery({
    queryKey: ["revenues-summary"],
    queryFn: () => api<Summary>("/revenues/summary"),
  });
  const { data: revenues = [] } = useQuery({
    queryKey: ["revenues"],
    queryFn: () => api<Revenue[]>("/revenues"),
  });

  const { register, handleSubmit, reset } = useForm<{
    amount: number;
    paymentMethod: string;
  }>({
    defaultValues: { paymentMethod: "PIX" },
  });

  const create = useMutation({
    mutationFn: (values: { amount: number; paymentMethod: string }) =>
      api("/revenues", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(values.amount),
          paymentMethod: values.paymentMethod,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["revenues"] });
      qc.invalidateQueries({ queryKey: ["revenues-summary"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      reset({ amount: undefined, paymentMethod: "PIX" });
    },
  });

  const cards = [
    ["Receita do mês", money(summary?.monthRevenue || 0)],
    ["Ticket médio", money(summary?.avgTicket || 0)],
    ["Receita recorrente", money(summary?.recurringRevenue || 0)],
  ] as const;

  return (
    <>
      <PageTitle eyebrow="RESULTADOS" title="FINANCEIRO" />
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-neutral-500">{label}</p>
            <p className="mt-2 font-display text-4xl">{value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_320px]">
        <Card>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">Lançamentos</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Gerados ao finalizar atendimentos ou lançados manualmente.
              </p>
            </div>
            <Badge>{summary?.monthTransactions || 0} no mês</Badge>
          </div>

          <div className="divide-y">
            {revenues.length ? (
              revenues.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="font-semibold">
                      {r.customer?.name || "Receita avulsa"}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {r.service?.name || "Sem serviço"}
                      {r.professional?.name
                        ? ` · ${r.professional.name}`
                        : ""}{" "}
                      · {methodLabel[r.paymentMethod] || r.paymentMethod}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {new Date(r.revenueDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <p className="font-bold">{money(Number(r.amount))}</p>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-neutral-500">
                Nenhuma receita ainda. Finalize um atendimento na agenda para
                gerar o primeiro lançamento.
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <h2 className="font-bold">Lançamento manual</h2>
            <form
              className="mt-4 space-y-3"
              onSubmit={handleSubmit((v) => create.mutate(v))}
            >
              <div>
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register("amount", { required: true, valueAsNumber: true })}
                />
              </div>
              <div>
                <Label>Forma de pagamento</Label>
                <select
                  className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
                  {...register("paymentMethod")}
                >
                  <option value="PIX">Pix</option>
                  <option value="CASH">Dinheiro</option>
                  <option value="CARD">Cartão</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>
              <Button className="w-full" disabled={create.isPending}>
                LANÇAR RECEITA
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="font-bold">Resumo</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Receita anual</span>
                <span className="font-semibold">
                  {money(summary?.yearRevenue || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total histórico</span>
                <span className="font-semibold">
                  {money(summary?.totalRevenue || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Clientes recorrentes</span>
                <span className="font-semibold">
                  {summary?.recurringCustomers || 0}
                </span>
              </div>
            </div>

            {!!summary?.topServices?.length && (
              <div className="mt-5">
                <p className="text-xs font-bold tracking-[.16em] text-[#9b7a44]">
                  TOP SERVIÇOS DO MÊS
                </p>
                <div className="mt-3 space-y-2">
                  {summary.topServices.map((s) => (
                    <div
                      key={s.name + s.count}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {s.name}{" "}
                        <span className="text-neutral-400">({s.count})</span>
                      </span>
                      <span className="font-semibold">{money(s.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
