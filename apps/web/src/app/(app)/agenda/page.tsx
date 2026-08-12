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
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

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
  services?: {
    serviceId?: string;
    price?: number | string;
    service?: { id?: string; name: string; price?: number | string };
  }[];
};
type Company = { openDates?: string[] };
type Availability = {
  date: string;
  open: boolean;
  slots: { startsAt: string; label: string }[];
};

type PeriodFilter = "today" | "week" | "month";

function money(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Data YYYY-MM-DD em America/Sao_Paulo */
function spDateParts(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value || 0);
  return { y: get("year"), m: get("month"), d: get("day") };
}

function spWeekday(isoDate: string) {
  // noon SP avoids edge issues
  return new Date(`${isoDate}T12:00:00-03:00`).getUTCDay();
}

function isoDateFromYmd(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function addDaysYmd(y: number, m: number, d: number, delta: number) {
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return {
    y: dt.getUTCFullYear(),
    m: dt.getUTCMonth() + 1,
    d: dt.getUTCDate(),
  };
}

function periodRange(period: PeriodFilter): { from: string; to: string; label: string } {
  const { y, m, d } = spDateParts();
  const today = isoDateFromYmd(y, m, d);

  if (period === "today") {
    return {
      from: `${today}T00:00:00.000-03:00`,
      to: `${today}T23:59:59.999-03:00`,
      label: "Hoje",
    };
  }

  if (period === "week") {
    const weekday = spWeekday(today); // 0=dom
    const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
    const mon = addDaysYmd(y, m, d, mondayOffset);
    const sun = addDaysYmd(mon.y, mon.m, mon.d, 6);
    const fromDay = isoDateFromYmd(mon.y, mon.m, mon.d);
    const toDay = isoDateFromYmd(sun.y, sun.m, sun.d);
    return {
      from: `${fromDay}T00:00:00.000-03:00`,
      to: `${toDay}T23:59:59.999-03:00`,
      label: "Esta semana",
    };
  }

  // month
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const fromDay = isoDateFromYmd(y, m, 1);
  const toDay = isoDateFromYmd(y, m, lastDay);
  return {
    from: `${fromDay}T00:00:00.000-03:00`,
    to: `${toDay}T23:59:59.999-03:00`,
    label: "Este mês",
  };
}

function formatDayLabel(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
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
  const user = useAuthStore((s) => s.user);
  const [customerId, setCustomerId] = useState("");
  const [changingId, setChangingId] = useState<string | null>(null);
  const [changeCustomerId, setChangeCustomerId] = useState("");
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStartsAt, setRescheduleStartsAt] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("today");
  const [filterProfessionalId, setFilterProfessionalId] = useState<string>("");

  const range = useMemo(() => periodRange(period), [period]);

  const { data: appointments = [], isFetching: loadingAppointments } = useQuery({
    queryKey: [
      "appointments",
      period,
      range.from,
      range.to,
      filterProfessionalId,
    ],
    queryFn: () => {
      const params = new URLSearchParams({
        from: range.from,
        to: range.to,
      });
      if (filterProfessionalId) {
        params.set("professionalId", filterProfessionalId);
      }
      return api<Appointment[]>(`/appointments?${params.toString()}`);
    },
  });
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: () => api<Service[]>("/services"),
  });
  const { data: professionals = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => api<Professional[]>("/users"),
  });
  const { data: company } = useQuery({
    queryKey: ["company"],
    queryFn: () => api<Company>("/company"),
  });

  const pros = professionals.filter(
    (p) => p.isProfessional && p.isActive !== false,
  );

  useEffect(() => {
    if (filterProfessionalId || user?.role !== "BARBEIRO" || !user?.id) return;
    if (pros.some((p) => p.id === user.id)) {
      setFilterProfessionalId(user.id);
    }
  }, [user?.role, user?.id, professionals, filterProfessionalId]);

  const { register, handleSubmit, reset, watch } = useForm<{
    professionalId: string;
    serviceId: string;
  }>({
    defaultValues: { professionalId: "", serviceId: "" },
  });

  const professionalId = watch("professionalId");
  const selectedServiceId = watch("serviceId");
  const selectedService = services.find((s) => s.id === selectedServiceId);
  const openDates = company?.openDates || [];

  const { data: availability, isFetching: loadingSlots } = useQuery({
    queryKey: [
      "appointments-availability",
      professionalId,
      selectedServiceId,
      selectedDate,
    ],
    queryFn: () =>
      api<Availability>(
        `/appointments/availability?professionalId=${professionalId}&serviceIds=${selectedServiceId}&date=${selectedDate}`,
      ),
    enabled: !!professionalId && !!selectedServiceId && !!selectedDate,
  });

  const slots = availability?.slots || [];

  const reschedulingAppointment = appointments.find(
    (a) => a.id === reschedulingId,
  );
  const rescheduleProfessionalId =
    reschedulingAppointment?.professional?.id || "";
  const rescheduleServiceId =
    reschedulingAppointment?.services?.[0]?.serviceId ||
    reschedulingAppointment?.services?.[0]?.service?.id ||
    "";

  const { data: rescheduleAvailability, isFetching: loadingRescheduleSlots } =
    useQuery({
      queryKey: [
        "appointments-reschedule-availability",
        rescheduleProfessionalId,
        rescheduleServiceId,
        rescheduleDate,
      ],
      queryFn: () =>
        api<Availability>(
          `/appointments/availability?professionalId=${rescheduleProfessionalId}&serviceIds=${rescheduleServiceId}&date=${rescheduleDate}&excludeAppointmentId=${reschedulingId}`,
        ),
      enabled:
        !!reschedulingId &&
        !!rescheduleProfessionalId &&
        !!rescheduleServiceId &&
        !!rescheduleDate,
    });

  const rescheduleSlots = rescheduleAvailability?.slots || [];

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["appointments"] });
    qc.invalidateQueries({ queryKey: ["appointments-availability"] });
    qc.invalidateQueries({ queryKey: ["revenues"] });
    qc.invalidateQueries({ queryKey: ["revenues-summary"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["customers"] });
  };

  const create = useMutation({
    mutationFn: (v: { professionalId: string; serviceId: string }) => {
      if (!customerId) throw new Error("Selecione um cliente");
      if (!startsAt) throw new Error("Selecione um horário disponível");
      return api("/appointments", {
        method: "POST",
        body: JSON.stringify({
          customerId,
          professionalId: v.professionalId,
          serviceIds: [v.serviceId],
          startsAt,
        }),
      });
    },
    onSuccess: () => {
      invalidateAll();
      reset({ professionalId: "", serviceId: "" });
      setCustomerId("");
      setSelectedDate("");
      setStartsAt("");
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

  const reschedule = useMutation({
    mutationFn: ({ id, startsAt }: { id: string; startsAt: string }) =>
      api(`/appointments/${id}/reschedule`, {
        method: "PATCH",
        body: JSON.stringify({ startsAt }),
      }),
    onSuccess: () => {
      invalidateAll();
      setReschedulingId(null);
      setRescheduleDate("");
      setRescheduleStartsAt("");
    },
  });

  function openReschedule(a: Appointment) {
    setChangingId(null);
    setReschedulingId(a.id);
    const day = new Date(a.startsAt).toLocaleDateString("en-CA", {
      timeZone: "America/Sao_Paulo",
    });
    setRescheduleDate(day);
    setRescheduleStartsAt("");
  }

  function closeReschedule() {
    setReschedulingId(null);
    setRescheduleDate("");
    setRescheduleStartsAt("");
  }

  return (
    <>
      <PageTitle eyebrow="OPERAÇÃO" title="AGENDA" />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card>
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-bold">Agenda</h2>
              <p className="mt-1 text-sm text-neutral-500">
                {range.label}
                {filterProfessionalId
                  ? ` · ${pros.find((p) => p.id === filterProfessionalId)?.name || "profissional"}`
                  : " · todos os profissionais"}
              </p>
            </div>
            <Badge>
              {loadingAppointments
                ? "..."
                : `${appointments.length} agendamento${appointments.length === 1 ? "" : "s"}`}
            </Badge>
          </div>

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="inline-flex rounded-md border border-neutral-200 bg-neutral-50 p-1">
              {(
                [
                  ["today", "Hoje"],
                  ["week", "Semana"],
                  ["month", "Mês"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPeriod(value)}
                  className={cn(
                    "rounded px-3 py-1.5 text-sm font-bold transition",
                    period === value
                      ? "bg-[#c4a574] text-[#171715]"
                      : "text-neutral-600 hover:text-[#171715]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="sm:min-w-[200px]">
              <select
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
                value={filterProfessionalId}
                onChange={(e) => setFilterProfessionalId(e.target.value)}
              >
                <option value="">Todos os profissionais</option>
                {pros.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
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
                  <div className="rounded-lg bg-neutral-50 p-4" key={a.id}>
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
                          onClick={() => openReschedule(a)}
                        >
                          REAGENDAR
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setReschedulingId(null);
                            setChangingId(a.id);
                            setChangeCustomerId(a.customer?.id || "");
                          }}
                        >
                          TROCAR CLIENTE
                        </Button>
                        <Button
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (
                              confirm(
                                "Cancelar este agendamento? Ele deixa de ocupar a agenda.",
                              )
                            ) {
                              cancel.mutate(a.id);
                            }
                          }}
                          disabled={cancel.isPending}
                        >
                          CANCELAR
                        </Button>
                      </div>
                    )}

                    {reschedulingId === a.id && (
                      <div className="mt-3 space-y-3 rounded-md border border-neutral-200 bg-white p-3">
                        <p className="text-sm font-semibold">
                          Novo horário
                          {a.professional?.name
                            ? ` · ${a.professional.name}`
                            : ""}
                          {a.services?.[0]?.service?.name
                            ? ` · ${a.services[0].service.name}`
                            : ""}
                        </p>
                        {!rescheduleProfessionalId || !rescheduleServiceId ? (
                          <p className="text-sm text-neutral-500">
                            Não foi possível carregar profissional/serviço deste
                            agendamento.
                          </p>
                        ) : !openDates.length ? (
                          <p className="text-sm text-neutral-500">
                            Nenhum dia de funcionamento configurado.
                          </p>
                        ) : (
                          <>
                            <div>
                              <Label>Dia</Label>
                              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                                {openDates.map((d) => (
                                  <button
                                    key={d}
                                    type="button"
                                    onClick={() => {
                                      setRescheduleDate(d);
                                      setRescheduleStartsAt("");
                                    }}
                                    className={`min-w-[5.25rem] shrink-0 rounded-lg border px-2.5 py-2 text-xs font-semibold ${
                                      rescheduleDate === d
                                        ? "border-[#c4a574] bg-[#c4a574] text-[#171715]"
                                        : "border-neutral-200 bg-white hover:border-[#c4a574]"
                                    }`}
                                  >
                                    {formatDayLabel(d)}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {rescheduleDate && (
                              <div>
                                <Label>Horários disponíveis</Label>
                                {loadingRescheduleSlots ? (
                                  <p className="mt-2 text-sm text-neutral-500">
                                    Buscando horários...
                                  </p>
                                ) : !rescheduleSlots.length ? (
                                  <p className="mt-2 text-sm text-neutral-500">
                                    Nenhum horário livre neste dia.
                                  </p>
                                ) : (
                                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                                    {rescheduleSlots.map((slot) => (
                                      <button
                                        key={slot.startsAt}
                                        type="button"
                                        onClick={() =>
                                          setRescheduleStartsAt(slot.startsAt)
                                        }
                                        className={`rounded-lg border px-2 py-2 text-sm font-bold ${
                                          rescheduleStartsAt === slot.startsAt
                                            ? "border-[#c4a574] bg-[#c4a574] text-[#171715]"
                                            : "border-neutral-200 bg-white hover:border-[#c4a574]"
                                        }`}
                                      >
                                        {slot.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                        {reschedule.error && (
                          <p className="text-sm text-red-600">
                            {(reschedule.error as Error).message}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            disabled={
                              !rescheduleStartsAt || reschedule.isPending
                            }
                            onClick={() =>
                              reschedule.mutate({
                                id: a.id,
                                startsAt: rescheduleStartsAt,
                              })
                            }
                          >
                            {reschedule.isPending
                              ? "SALVANDO..."
                              : "SALVAR HORÁRIO"}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={closeReschedule}
                          >
                            FECHAR
                          </Button>
                        </div>
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
                Nenhum atendimento em {range.label.toLowerCase()}.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-bold">Novo agendamento</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Escolha o dia e veja só os horários livres — igual ao link público.
          </p>
          <form
            className="mt-5 space-y-3"
            onSubmit={handleSubmit((v) => {
              if (create.isPending) return;
              create.mutate(v);
            })}
          >
            <CustomerSearch
              value={customerId}
              onChange={(id) => setCustomerId(id)}
            />
            <div>
              <Label>Profissional</Label>
              <select
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
                {...register("professionalId", {
                  required: true,
                  onChange: () => {
                    setSelectedDate("");
                    setStartsAt("");
                  },
                })}
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
                {...register("serviceId", {
                  required: true,
                  onChange: () => {
                    setSelectedDate("");
                    setStartsAt("");
                  },
                })}
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
              <Label>Dia</Label>
              {!professionalId || !selectedServiceId ? (
                <p className="mt-2 text-sm text-neutral-500">
                  Selecione profissional e serviço para ver os dias.
                </p>
              ) : !openDates.length ? (
                <p className="mt-2 text-sm text-neutral-500">
                  Nenhum dia de funcionamento configurado.
                </p>
              ) : (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                  {openDates.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setSelectedDate(d);
                        setStartsAt("");
                      }}
                      className={`min-w-[5.25rem] shrink-0 rounded-lg border px-2.5 py-2 text-xs font-semibold ${
                        selectedDate === d
                          ? "border-[#c4a574] bg-[#c4a574] text-[#171715]"
                          : "border-neutral-200 bg-white hover:border-[#c4a574]"
                      }`}
                    >
                      {formatDayLabel(d)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedDate && (
              <div>
                <Label>Horários disponíveis</Label>
                {loadingSlots ? (
                  <p className="mt-2 text-sm text-neutral-500">
                    Buscando horários...
                  </p>
                ) : !slots.length ? (
                  <p className="mt-2 text-sm text-neutral-500">
                    Nenhum horário livre neste dia.
                  </p>
                ) : (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.startsAt}
                        type="button"
                        onClick={() => setStartsAt(slot.startsAt)}
                        className={`rounded-lg border px-2 py-2 text-sm font-bold ${
                          startsAt === slot.startsAt
                            ? "border-[#c4a574] bg-[#c4a574] text-[#171715]"
                            : "border-neutral-200 bg-white hover:border-[#c4a574]"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(create.error as Error | null) && (
              <p className="text-sm text-red-600">
                {(create.error as Error).message}
              </p>
            )}
            <Button
              className="w-full"
              disabled={
                create.isPending || !customerId || !startsAt || !selectedDate
              }
            >
              {create.isPending ? "AGENDANDO..." : "AGENDAR"}
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
