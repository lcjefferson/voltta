"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/app-page";
import { ListPagination } from "@/components/list-pagination";
import { useFeedback } from "@/providers/feedback-provider";

const PAGE_SIZE = 20;

type Lead = {
  id: string;
  name: string;
  whatsapp?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  lastInboundAt?: string | null;
  lastInboundMessage?: string | null;
  source?: string;
};

type LeadsResponse = {
  data: Lead[];
  total: number;
  page: number;
  limit: number;
};

type LeadForm = {
  name: string;
  phone?: string;
  birthDate?: string;
};

function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export default function LeadsPage() {
  const qc = useQueryClient();
  const { confirm } = useFeedback();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ["leads", page],
    queryFn: () =>
      api<LeadsResponse>(`/leads?page=${page}&limit=${PAGE_SIZE}`),
  });
  const leads = data?.data ?? [];
  const total = data?.total ?? leads.length;

  const { register, handleSubmit, reset } = useForm<LeadForm>();

  const convert = useMutation({
    mutationFn: (id: string) =>
      api(`/customers/${id}/convert`, { method: "POST", body: "{}" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["customers"] });
      setEditingId(null);
    },
  });

  const update = useMutation({
    mutationFn: (payload: LeadForm & { id: string }) =>
      api(`/customers/${payload.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: payload.name,
          phone: payload.phone || undefined,
          whatsapp: payload.phone || undefined,
          birthDate: payload.birthDate || null,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      setEditingId(null);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/customers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      setEditingId(null);
    },
  });

  function startEdit(lead: Lead) {
    setEditingId(lead.id);
    reset({
      name: lead.name,
      phone: lead.whatsapp || lead.phone || "",
      birthDate: toDateInput(lead.birthDate),
    });
  }

  return (
    <>
      <PageTitle eyebrow="CRM" title="LEADS" />
      <Card>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div>
            <h2 className="font-bold">Contatos via WhatsApp</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Quem manda mensagem vira lead. Ao agendar, vira cliente
              automaticamente.
            </p>
          </div>
          <Badge>{total} leads</Badge>
        </div>
        <div className="divide-y">
          {leads.length ? (
            leads.map((lead) => (
              <div className="py-4" key={lead.id}>
                {editingId === lead.id ? (
                  <form
                    className="space-y-3"
                    onSubmit={handleSubmit((v) =>
                      update.mutate({ ...v, id: lead.id }),
                    )}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Nome</Label>
                        <Input {...register("name", { required: true })} />
                      </div>
                      <div>
                        <Label>WhatsApp</Label>
                        <Input
                          {...register("phone")}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>
                    <div className="max-w-xs">
                      <Label>Data de aniversário</Label>
                      <Input type="date" {...register("birthDate")} />
                    </div>
                    {update.isError && (
                      <p className="text-sm text-red-600">
                        {(update.error as Error).message}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" disabled={update.isPending}>
                        {update.isPending ? "SALVANDO..." : "SALVAR"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        CANCELAR
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={convert.isPending}
                        onClick={() => convert.mutate(lead.id)}
                      >
                        VIRAR CLIENTE
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        disabled={remove.isPending}
                        onClick={async () => {
                          const ok = await confirm({
                            title: "Excluir lead",
                            message: `Excluir o lead "${lead.name}"? Ele some da lista.`,
                            confirmLabel: "EXCLUIR",
                            tone: "danger",
                          });
                          if (ok) remove.mutate(lead.id);
                        }}
                      >
                        EXCLUIR
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">{lead.name}</p>
                      <p className="text-sm text-neutral-500">
                        {lead.whatsapp || lead.phone || "Sem WhatsApp"}
                      </p>
                      {lead.lastInboundMessage && (
                        <p className="mt-1 max-w-xl text-sm text-neutral-600">
                          “{lead.lastInboundMessage}”
                        </p>
                      )}
                      <p className="mt-1 text-xs text-neutral-400">
                        {lead.lastInboundAt
                          ? new Date(lead.lastInboundAt).toLocaleString("pt-BR")
                          : "Sem mensagem recente"}
                        {lead.source ? ` · ${lead.source}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => startEdit(lead)}
                      >
                        EDITAR
                      </Button>
                      <Button
                        variant="outline"
                        disabled={convert.isPending}
                        onClick={() => convert.mutate(lead.id)}
                      >
                        VIRAR CLIENTE
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-red-700 hover:bg-red-50"
                        disabled={remove.isPending}
                        onClick={async () => {
                          const ok = await confirm({
                            title: "Excluir lead",
                            message: `Excluir o lead "${lead.name}"? Ele some da lista.`,
                            confirmLabel: "EXCLUIR",
                            tone: "danger",
                          });
                          if (ok) remove.mutate(lead.id);
                        }}
                      >
                        EXCLUIR
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="py-10 text-center text-sm text-neutral-500">
              Nenhum lead ainda. Quando alguém falar no WhatsApp conectado,
              aparece aqui.
            </p>
          )}
        </div>
        <ListPagination
          page={page}
          limit={PAGE_SIZE}
          total={total}
          onPageChange={(next) => {
            setEditingId(null);
            setPage(next);
          }}
          noun="leads"
        />
      </Card>
    </>
  );
}
