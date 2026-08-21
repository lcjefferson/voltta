"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/app-page";
import { useFeedback } from "@/providers/feedback-provider";

type Service = {
  id: string;
  name: string;
  price: number | string;
  durationMinutes: number;
  returnIntervalDays?: number | null;
  isActive: boolean;
};

type ServiceForm = {
  name: string;
  price: number;
  durationMinutes: number;
  returnIntervalDays?: number | null;
};

function money(value: number | string) {
  return Number(value).toFixed(2).replace(".", ",");
}

export default function ServicosPage() {
  const qc = useQueryClient();
  const { confirm } = useFeedback();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: () => api<Service[]>("/services"),
  });

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
  } = useForm<ServiceForm>();

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
  } = useForm<ServiceForm>();

  const create = useMutation({
    mutationFn: (v: ServiceForm) =>
      api("/services", {
        method: "POST",
        body: JSON.stringify({
          name: v.name,
          price: Number(v.price),
          durationMinutes: Number(v.durationMinutes),
          returnIntervalDays: v.returnIntervalDays
            ? Number(v.returnIntervalDays)
            : undefined,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      resetCreate();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    },
  });

  const update = useMutation({
    mutationFn: (payload: ServiceForm & { id: string }) =>
      api(`/services/${payload.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: payload.name,
          price: Number(payload.price),
          durationMinutes: Number(payload.durationMinutes),
          returnIntervalDays: payload.returnIntervalDays
            ? Number(payload.returnIntervalDays)
            : null,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      setEditingId(null);
    },
  });

  const deactivate = useMutation({
    mutationFn: (id: string) =>
      api(`/services/${id}/deactivate`, { method: "PATCH" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      setEditingId(null);
    },
  });

  const reactivate = useMutation({
    mutationFn: (id: string) =>
      api(`/services/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: true }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });

  function startEdit(s: Service) {
    setEditingId(s.id);
    resetEdit({
      name: s.name,
      price: Number(s.price),
      durationMinutes: s.durationMinutes,
      returnIntervalDays: s.returnIntervalDays ?? undefined,
    });
  }

  return (
    <>
      <PageTitle eyebrow="OPERAÇÃO" title="SERVIÇOS" />
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <Card>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <h2 className="font-bold">Serviços cadastrados</h2>
            <span className="text-sm text-neutral-500">
              {services.length}{" "}
              {services.length === 1 ? "serviço" : "serviços"}
            </span>
          </div>
          <div className="divide-y">
            {isLoading ? (
              <p className="py-10 text-center text-sm text-neutral-500">
                Carregando serviços...
              </p>
            ) : services.length ? (
              services.map((s) => (
                <div className="py-4" key={s.id}>
                  {editingId === s.id ? (
                    <form
                      className="space-y-3"
                      onSubmit={handleEditSubmit((v) =>
                        update.mutate({ ...v, id: s.id }),
                      )}
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <Label>Nome</Label>
                          <Input
                            {...registerEdit("name", { required: true })}
                          />
                        </div>
                        <div>
                          <Label>Preço (R$)</Label>
                          <Input
                            type="number"
                            step=".01"
                            {...registerEdit("price", {
                              required: true,
                              valueAsNumber: true,
                            })}
                          />
                        </div>
                        <div>
                          <Label>Duração (min)</Label>
                          <Input
                            type="number"
                            {...registerEdit("durationMinutes", {
                              required: true,
                              valueAsNumber: true,
                            })}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label>Intervalo de retorno (dias)</Label>
                          <Input
                            type="number"
                            {...registerEdit("returnIntervalDays", {
                              valueAsNumber: true,
                            })}
                            placeholder="20"
                          />
                        </div>
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
                        {s.isActive && (
                          <Button
                            type="button"
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                            disabled={deactivate.isPending}
                            onClick={async () => {
                              const ok = await confirm({
                                title: "Desativar serviço",
                                message: `Desativar "${s.name}"? Ele some da agenda e do agendamento online.`,
                                confirmLabel: "DESATIVAR",
                                tone: "danger",
                              });
                              if (ok) deactivate.mutate(s.id);
                            }}
                          >
                            DESATIVAR
                          </Button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold break-words">{s.name}</p>
                          {!s.isActive && (
                            <Badge className="bg-neutral-200 text-neutral-600">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-neutral-500">
                          {s.durationMinutes} min
                          {s.returnIntervalDays
                            ? ` · retorno ${s.returnIntervalDays} dias`
                            : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold">R$ {money(s.price)}</p>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 px-3 text-xs"
                          onClick={() => startEdit(s)}
                        >
                          EDITAR
                        </Button>
                        {s.isActive ? (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 px-3 text-xs text-red-700"
                            disabled={deactivate.isPending}
                            onClick={async () => {
                              const ok = await confirm({
                                title: "Desativar serviço",
                                message: `Desativar "${s.name}"?`,
                                confirmLabel: "DESATIVAR",
                                tone: "danger",
                              });
                              if (ok) deactivate.mutate(s.id);
                            }}
                          >
                            Desativar
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 px-3 text-xs"
                            disabled={reactivate.isPending}
                            onClick={() => reactivate.mutate(s.id)}
                          >
                            Reativar
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-neutral-500">
                Cadastre seu primeiro serviço.
              </p>
            )}
          </div>
        </Card>
        <Card>
          <h2 className="font-bold">Novo serviço</h2>
          <form
            className="mt-5 space-y-3"
            onSubmit={handleCreateSubmit((v) => create.mutate(v))}
          >
            <div>
              <Label>Nome</Label>
              <Input {...registerCreate("name", { required: true })} />
            </div>
            <div>
              <Label>Preço (R$)</Label>
              <Input
                type="number"
                step=".01"
                {...registerCreate("price", {
                  required: true,
                  valueAsNumber: true,
                })}
              />
            </div>
            <div>
              <Label>Duração (min)</Label>
              <Input
                type="number"
                {...registerCreate("durationMinutes", {
                  required: true,
                  valueAsNumber: true,
                })}
              />
            </div>
            <div>
              <Label>Intervalo de retorno (dias)</Label>
              <Input
                type="number"
                {...registerCreate("returnIntervalDays", {
                  valueAsNumber: true,
                })}
                placeholder="20"
              />
            </div>
            <Button className="w-full" disabled={create.isPending}>
              {create.isPending ? "Salvando..." : "ADICIONAR SERVIÇO"}
            </Button>
            {create.isError && (
              <p className="text-sm text-red-600">
                {(create.error as Error).message || "Não foi possível criar."}
              </p>
            )}
          </form>
        </Card>
      </div>
    </>
  );
}
