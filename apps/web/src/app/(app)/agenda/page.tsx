"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageTitle } from "@/components/app-page";
import { BookingLinkCard } from "@/components/booking-link-card";

type Customer = { id: string; name: string; whatsapp?: string | null };
type Service = { id: string; name: string; price?: number | string };
type Professional = {
  id: string;
  name: string;
  isProfessional?: boolean;
  isActive?: boolean;
};
type Appointment = {
  id: string;
  startsAt: string;
  status: string;
  totalAmount?: number | string;
  customer?: { id: string; name: string };
  professional?: { id: string; name: string };
  services?: { price?: number | string; service?: { name: string; price?: number | string } }[];
};

function money(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function statusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "Pendente";
    case "CONFIRMED":
      return "Confirmado";
    case "COMPLETED":
      return "Finalizado";
    case "CANCELED":
      return "Cancelado";
    default:
      return status;
  }
}

function CustomerSearch({
  value,
  onChange,
  label = "Cliente",
}: {
  value: string;
  onChange: (id: string, customer?: Customer) => void;
  label?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["customers-search", query],
    queryFn: () =>
      api<{ data: Customer[] }>(
        `/customers?limit=20${query ? `&q=${encodeURIComponent(query)}` : ""}`,
      ),
  });

  // also search leads by name via same endpoint with stage? customers default CUSTOMER only.
  // Include both: fetch customers + leads when searching
  const { data: leadsData } = useQuery({
    queryKey: ["leads-search", query],
    queryFn: () =>
      api<{ data: Customer[] }>(
        `/leads?limit=20${query ? `&q=${encodeURIComponent(query)}` : ""}`,
      ),
    enabled: query.length >= 1,
  });

  const options = useMemo(() => {
    const map = new Map<string, Customer>();
    for (const c of data?.data || []) map.set(c.id, c);
    for (const c of leadsData?.data || []) map.set(c.id, c);
    return Array.from(map.values());
  }, [data, leadsData]);

  const selected = options.find((c) => c.id === value);

  useEffect(() => {
    if (selected) setQuery(selected.name);
  }, [selected?.id]);

  return (
    <div className="relative">
      <Label>{label}</Label>
      <Input
        value={query}
        placeholder="Digite o nome do cliente..."
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (!e.target.value) onChange("");
        }}
      />
      {open && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-neutral-200 bg-white shadow-sm">
          {options.length ? (
            options.map((c) => (
              <button
                type="button"
                key={c.id}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50"
                onClick={() => {
                  onChange(c.id, c);
                  setQuery(c.name);
                  setOpen(false);
                }}
              >
                <span className="font-medium">{c.name}</span>
                {c.whatsapp && (
                  <span className="ml-2 text-neutral-400">{c.whatsapp}</span>
                )}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-neutral-500">
              Nenhum cliente encontrado
            </p>
          )}
        </div>
      )}
      {value && (
        <p className="mt-1 text-xs text-neutral-500">Cliente selecionado</p>
      )}
    </div>
  );
}

export default function AgendaPage() {
  const qc = useQueryClient();
  const [customerId, setCustomerId] = useState("");
  const [changingId, setChangingId] = useState<string | null>(null);
  const [changeCustomerId, setChangeCustomerId] = useState("");

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => api<Appointment[]>("/appointments"),
  });
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: () => api<Service[]>("/services"),
  });
  const { data: professionals = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => api<Professional[]>("/users"),
  });

  const { register, handleSubmit, reset, watch } = useForm<{
    professionalId: string;
    serviceId: string;
    startsAt: string;
  }>();

  const selectedServiceId = watch("serviceId");
  const selectedService = services.find((s) => s.id === selectedServiceId);

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["appointments"] });
    qc.invalidateQueries({ queryKey: ["revenues"] });
    qc.invalidateQueries({ queryKey: ["revenues-summary"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["customers"] });
  };

  const create = useMutation({
    mutationFn: (v: {
      professionalId: string;
      serviceId: string;
      startsAt: string;
    }) => {
      if (!customerId) throw new Error("Selecione um cliente");
      return api("/appointments", {
        method: "POST",
        body: JSON.stringify({
          customerId,
          professionalId: v.professionalId,
          serviceIds: [v.serviceId],
          startsAt: new Date(v.startsAt).toISOString(),
        }),
      });
    },
    onSuccess: () => {
      invalidateAll();
      reset();
      setCustomerId("");
    },
  });

  const complete = useMutation({
    mutationFn: (id: string) =>
      api(`/appointments/${id}/complete`, { method: "PATCH" }),
    onSuccess: invalidateAll,
  });

  const cancel = useMutation({
    mutationFn: (id: string) =>
      api(`/appointments/${id}/cancel`, { method: "PATCH" }),
    onSuccess: invalidateAll,
  });

  const changeCustomer = useMutation({
    mutationFn: ({ id, customerId }: { id: string; customerId: string }) =>
      api(`/appointments/${id}/customer`, {
        method: "PATCH",
        body: JSON.stringify({ customerId }),
      }),
    onSuccess: () => {
      invalidateAll();
      setChangingId(null);
      setChangeCustomerId("");
    },
  });

  const pros = professionals.filter(
    (p) => p.isProfessional && p.isActive !== false,
  );

  return (
    <>
      <PageTitle eyebrow="OPERAÇÃO" title="AGENDA" />
      <div className="mb-5">
        <BookingLinkCard />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Próximos horários</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Ao finalizar, o valor do serviço entra automático no financeiro.
              </p>
            </div>
            <Badge>{appointments.length} agendamentos</Badge>
          </div>
          <div className="space-y-3">
            {appointments.length ? (
              appointments.map((a) => {
                const amount = Number(
                  a.totalAmount ??
                    a.services?.[0]?.price ??
                    a.services?.[0]?.service?.price ??
                    0,
                );
                const canAct =
                  a.status !== "CANCELED" && a.status !== "COMPLETED";
                return (
                  <div
                    className="rounded-lg bg-neutral-50 p-4"
                    key={a.id}
                  >
                    <div className="flex items-start gap-4">
                      <span className="font-display text-2xl text-[#9b7a44]">
                        {new Date(a.startsAt).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold">
                          {a.customer?.name ?? "Cliente"}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {a.services?.[0]?.service?.name ?? "Serviço"}
                          {a.professional?.name
                            ? ` · ${a.professional.name}`
                            : ""}
                          {amount ? ` · ${money(amount)}` : ""}
                        </p>
                      </div>
                      <Badge>{statusLabel(a.status)}</Badge>
                    </div>

                    {canAct && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          onClick={() => complete.mutate(a.id)}
                          disabled={complete.isPending}
                        >
                          FINALIZAR
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setChangingId(a.id);
                            setChangeCustomerId(a.customer?.id || "");
                          }}
                        >
                          TROCAR CLIENTE
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (confirm("Cancelar este agendamento?")) {
                              cancel.mutate(a.id);
                            }
                          }}
                          disabled={cancel.isPending}
                        >
                          CANCELAR
                        </Button>
                      </div>
                    )}

                    {changingId === a.id && (
                      <div className="mt-3 space-y-3 rounded-md border border-neutral-200 bg-white p-3">
                        <CustomerSearch
                          label="Novo cliente"
                          value={changeCustomerId}
                          onChange={(id) => setChangeCustomerId(id)}
                        />
                        <div className="flex gap-2">
                          <Button
                            disabled={
                              !changeCustomerId || changeCustomer.isPending
                            }
                            onClick={() =>
                              changeCustomer.mutate({
                                id: a.id,
                                customerId: changeCustomerId,
                              })
                            }
                          >
                            SALVAR
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setChangingId(null)}
                          >
                            FECHAR
                          </Button>
                        </div>
                        {changeCustomer.error && (
                          <p className="text-sm text-red-600">
                            {(changeCustomer.error as Error).message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="py-10 text-center text-sm text-neutral-500">
                Nenhum atendimento marcado.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-bold">Novo agendamento</h2>
          <form
            className="mt-5 space-y-3"
            onSubmit={handleSubmit((v) => create.mutate(v))}
          >
            <CustomerSearch
              value={customerId}
              onChange={(id) => setCustomerId(id)}
            />
            <div>
              <Label>Profissional</Label>
              <select
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
                {...register("professionalId", { required: true })}
              >
                <option value="">Selecione</option>
                {pros.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Serviço</Label>
              <select
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
                {...register("serviceId", { required: true })}
              >
                <option value="">Selecione</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.price != null ? ` — ${money(Number(s.price))}` : ""}
                  </option>
                ))}
              </select>
              {selectedService?.price != null && (
                <p className="mt-1 text-xs text-neutral-500">
                  Ao finalizar, lança {money(Number(selectedService.price))} no
                  financeiro.
                </p>
              )}
            </div>
            <div>
              <Label>Data e hora</Label>
              <Input
                type="datetime-local"
                {...register("startsAt", { required: true })}
              />
            </div>
            {(create.error as Error | null) && (
              <p className="text-sm text-red-600">
                {(create.error as Error).message}
              </p>
            )}
            <Button
              className="w-full"
              disabled={create.isPending || !customerId}
            >
              AGENDAR
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
