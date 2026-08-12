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

type Customer = {
  id: string;
  name: string;
  phone?: string | null;
  whatsapp?: string | null;
  birthDate?: string | null;
  lastVisitAt?: string | null;
};

type CustomersResponse = { data: Customer[]; total: number };

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

export default function ClientesPage() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBirthDate, setEditBirthDate] = useState("");

  const { data } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api<CustomersResponse>("/customers?limit=100"),
  });
  const customers = data?.data ?? [];
  const { register, handleSubmit, reset } = useForm<{
    name: string;
    phone?: string;
    birthDate?: string;
  }>();

  const create = useMutation({
    mutationFn: (values: {
      name: string;
      phone?: string;
      birthDate?: string;
    }) =>
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
      reset();
    },
  });

  const updateBirthDate = useMutation({
    mutationFn: (payload: { id: string; birthDate: string }) =>
      api(`/customers/${payload.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          birthDate: payload.birthDate || null,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      setEditingId(null);
      setEditBirthDate("");
    },
  });

  return (
    <>
      <PageTitle eyebrow="RELACIONAMENTO" title="CLIENTES" />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <div className="mb-5 flex justify-between">
            <h2 className="font-bold">Sua base de clientes</h2>
            <span className="text-sm text-neutral-500">
              {data?.total ?? customers.length} cadastrados
            </span>
          </div>
          <div className="divide-y">
            {customers.length ? (
              customers.map((c) => (
                <div
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  key={c.id}
                >
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-neutral-500">
                      {c.whatsapp || c.phone || "Sem telefone"}
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
                  {editingId === c.id ? (
                    <div className="flex flex-wrap items-end gap-2">
                      <div>
                        <Label className="text-xs">Data</Label>
                        <Input
                          type="date"
                          value={editBirthDate}
                          onChange={(e) => setEditBirthDate(e.target.value)}
                          className="w-[11rem]"
                        />
                      </div>
                      <Button
                        type="button"
                        disabled={updateBirthDate.isPending}
                        onClick={() =>
                          updateBirthDate.mutate({
                            id: c.id,
                            birthDate: editBirthDate,
                          })
                        }
                      >
                        SALVAR
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(null);
                          setEditBirthDate("");
                        }}
                      >
                        CANCELAR
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => {
                        setEditingId(c.id);
                        setEditBirthDate(toDateInput(c.birthDate));
                      }}
                    >
                      {c.birthDate ? "EDITAR DATA" : "INFORMAR DATA"}
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-neutral-500">
                Nenhum cliente por aqui ainda.
              </p>
            )}
          </div>
        </Card>
        <Card>
          <h2 className="font-bold">Novo cliente</h2>
          <p className="mt-1 text-sm text-neutral-500">
            A data de aniversário alimenta a automação A5.
          </p>
          <form
            onSubmit={handleSubmit((v) => create.mutate(v))}
            className="mt-5 space-y-3"
          >
            <div>
              <Label>Nome</Label>
              <Input {...register("name", { required: true })} />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input {...register("phone")} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <Label>Data de aniversário</Label>
              <Input type="date" {...register("birthDate")} />
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
