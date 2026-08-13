"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/app-page";
import { ListPagination } from "@/components/list-pagination";
import { useFeedback } from "@/providers/feedback-provider";

const PAGE_SIZE = 20;

type Customer = {
  id: string;
  name: string;
  phone?: string | null;
  whatsapp?: string | null;
  birthDate?: string | null;
  lastVisitAt?: string | null;
};

type CustomersResponse = {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
};

type CustomerForm = {
  name: string;
  phone?: string;
  birthDate?: string;
};

function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function formatBirthDate(value?: string | null) {
  if (!value) return null;
  const [y, m, d] = value.slice(0, 10).split("-");
  if (!y || !m || !d) return null;
  return `${d}/${m}/${y}`;
}

function displayPhone(c: Customer) {
  return c.whatsapp || c.phone || "Sem telefone";
}

export default function ClientesPage() {
  const qc = useQueryClient();
  const { confirm } = useFeedback();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ["customers", page],
    queryFn: () =>
      api<CustomersResponse>(`/customers?page=${page}&limit=${PAGE_SIZE}`),
  });
  const customers = data?.data ?? [];
  const total = data?.total ?? customers.length;

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
  } = useForm<CustomerForm>();

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
  } = useForm<CustomerForm>();

  const create = useMutation({
    mutationFn: (values: CustomerForm) =>
      api("/customers", {
        method: "POST",
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          whatsapp: values.phone,
          birthDate: values.birthDate || undefined,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      resetCreate();
    },
  });

  const update = useMutation({
    mutationFn: (payload: CustomerForm & { id: string }) =>
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
      qc.invalidateQueries({ queryKey: ["customers"] });
      setEditingId(null);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/customers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      setEditingId(null);
    },
  });

  function startEdit(c: Customer) {
    setEditingId(c.id);
    resetEdit({
      name: c.name,
      phone: c.whatsapp || c.phone || "",
      birthDate: toDateInput(c.birthDate),
    });
  }

  return (
    <>
      <PageTitle eyebrow="RELACIONAMENTO" title="CLIENTES" />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <div className="mb-5 flex justify-between">
            <h2 className="font-bold">Sua base de clientes</h2>
            <span className="text-sm text-neutral-500">
              {total} cadastrados
            </span>
          </div>
          <div className="divide-y">
            {customers.length ? (
              customers.map((c) => (
                <div className="py-4" key={c.id}>
                  {editingId === c.id ? (
                    <form
                      className="space-y-3"
                      onSubmit={handleEditSubmit((v) =>
                        update.mutate({ ...v, id: c.id }),
                      )}
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <Label>Nome</Label>
                          <Input
                            {...registerEdit("name", { required: true })}
                          />
                        </div>
                        <div>
                          <Label>WhatsApp</Label>
                          <Input
                            {...registerEdit("phone")}
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                      </div>
                      <div className="max-w-xs">
                        <Label>Data de aniversário</Label>
                        <Input type="date" {...registerEdit("birthDate")} />
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
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          disabled={remove.isPending}
                          onClick={async () => {
                            const ok = await confirm({
                              title: "Excluir cliente",
                              message: `Excluir o cliente "${c.name}"? Essa ação não remove o histórico, só some da lista.`,
                              confirmLabel: "EXCLUIR",
                              tone: "danger",
                            });
                            if (ok) remove.mutate(c.id);
                          }}
                        >
                          EXCLUIR
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-sm text-neutral-500">
                          {displayPhone(c)}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          Aniversário:{" "}
                          {formatBirthDate(c.birthDate) || "não informado"}
                          {c.lastVisitAt
                            ? ` · última visita ${new Date(
                                c.lastVisitAt,
                              ).toLocaleDateString("pt-BR")}`
                            : " · novo cliente"}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => startEdit(c)}
                        >
                          EDITAR
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-700 hover:bg-red-50"
                          disabled={remove.isPending}
                          onClick={async () => {
                            const ok = await confirm({
                              title: "Excluir cliente",
                              message: `Excluir o cliente "${c.name}"? Essa ação não remove o histórico, só some da lista.`,
                              confirmLabel: "EXCLUIR",
                              tone: "danger",
                            });
                            if (ok) remove.mutate(c.id);
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
                Nenhum cliente por aqui ainda.
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
            noun="clientes"
          />
        </Card>
        <Card>
          <h2 className="font-bold">Novo cliente</h2>
          <p className="mt-1 text-sm text-neutral-500">
            A data de aniversário alimenta a automação A5.
          </p>
          <form
            onSubmit={handleCreateSubmit((v) => create.mutate(v))}
            className="mt-5 space-y-3"
          >
            <div>
              <Label>Nome</Label>
              <Input {...registerCreate("name", { required: true })} />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input
                {...registerCreate("phone")}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label>Data de aniversário</Label>
              <Input type="date" {...registerCreate("birthDate")} />
            </div>
            <Button disabled={create.isPending} className="w-full">
              ADICIONAR CLIENTE
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
