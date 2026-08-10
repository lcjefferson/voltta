"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/app-page";

type Service = {
  id: string;
  name: string;
  price: number | string;
  durationMinutes: number;
  returnIntervalDays?: number | null;
};

export default function ServicosPage() {
  const qc = useQueryClient();
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: () => api<Service[]>("/services"),
  });
  const { register, handleSubmit, reset } = useForm<{
    name: string;
    price: number;
    durationMinutes: number;
    returnIntervalDays?: number;
  }>();
  const create = useMutation({
    mutationFn: (v: {
      name: string;
      price: number;
      durationMinutes: number;
      returnIntervalDays?: number;
    }) =>
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
      reset();
    },
  });

  return (
    <>
      <PageTitle eyebrow="OPERAÇÃO" title="SERVIÇOS" />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <h2 className="mb-4 font-bold">Serviços cadastrados</h2>
          <div className="divide-y">
            {services.length ? (
              services.map((s) => (
                <div className="flex justify-between py-4" key={s.id}>
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-sm text-neutral-500">
                      {s.durationMinutes} min
                      {s.returnIntervalDays
                        ? ` · retorno ${s.returnIntervalDays} dias`
                        : ""}
                    </p>
                  </div>
                  <p className="font-bold">
                    R$ {Number(s.price).toFixed(2).replace(".", ",")}
                  </p>
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
            onSubmit={handleSubmit((v) => create.mutate(v))}
          >
            <div>
              <Label>Nome</Label>
              <Input {...register("name", { required: true })} />
            </div>
            <div>
              <Label>Preço (R$)</Label>
              <Input
                type="number"
                step=".01"
                {...register("price", { required: true, valueAsNumber: true })}
              />
            </div>
            <div>
              <Label>Duração (min)</Label>
              <Input
                type="number"
                {...register("durationMinutes", {
                  required: true,
                  valueAsNumber: true,
                })}
              />
            </div>
            <div>
              <Label>Intervalo de retorno (dias)</Label>
              <Input
                type="number"
                {...register("returnIntervalDays", { valueAsNumber: true })}
                placeholder="20"
              />
            </div>
            <Button className="w-full">ADICIONAR SERVIÇO</Button>
          </form>
        </Card>
      </div>
    </>
  );
}
