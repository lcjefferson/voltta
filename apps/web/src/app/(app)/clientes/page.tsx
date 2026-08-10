"use client";

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
  lastVisitAt?: string | null;
};

type CustomersResponse = { data: Customer[]; total: number };

export default function ClientesPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api<CustomersResponse>("/customers?limit=100"),
  });
  const customers = data?.data ?? [];
  const { register, handleSubmit, reset } = useForm<{
    name: string;
    phone?: string;
  }>();
  const create = useMutation({
    mutationFn: (values: { name: string; phone?: string }) =>
      api("/customers", {
        method: "POST",
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          whatsapp: values.phone,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      reset();
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
                <div className="flex justify-between py-4" key={c.id}>
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-neutral-500">
                      {c.whatsapp || c.phone || "Sem telefone"}
                    </p>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {c.lastVisitAt
                      ? new Date(c.lastVisitAt).toLocaleDateString("pt-BR")
                      : "Novo cliente"}
                  </p>
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
            <Button disabled={create.isPending} className="w-full">
              ADICIONAR CLIENTE
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
