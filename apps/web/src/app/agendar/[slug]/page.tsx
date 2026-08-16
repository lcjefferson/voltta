"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Service = {
  id: string;
  name: string;
  price: number | string;
  durationMinutes: number;
};
type Professional = { id: string; name: string };
type Company = {
  name: string;
  slug: string;
  openDates?: string[];
};
type Availability = {
  date: string;
  open: boolean;
  slots: { startsAt: string; label: string }[];
};

function formatDayLabel(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const {
    data: shop,
    isError: shopError,
    isLoading: shopLoading,
  } = useQuery({
    queryKey: ["public", slug],
    queryFn: () => api<Company>(`/public/${slug}`),
    retry: false,
  });
  const { data: services = [] } = useQuery({
    queryKey: ["public-services", slug],
    queryFn: () => api<Service[]>(`/public/${slug}/services`),
    enabled: !!shop,
  });
  const { data: professionals = [] } = useQuery({
    queryKey: ["public-pros", slug],
    queryFn: () => api<Professional[]>(`/public/${slug}/professionals`),
    enabled: !!shop,
  });

  const { data: availability, isFetching: loadingSlots } = useQuery({
    queryKey: [
      "public-availability",
      slug,
      professionalId,
      serviceId,
      selectedDate,
    ],
    queryFn: () =>
      api<Availability>(
        `/public/${slug}/availability?professionalId=${professionalId}&serviceIds=${serviceId}&date=${selectedDate}`,
      ),
    enabled: !!shop && !!professionalId && !!serviceId && !!selectedDate,
  });

  const book = useMutation({
    mutationFn: () =>
      api(`/public/${slug}/appointments`, {
        method: "POST",
        body: JSON.stringify({
          name,
          whatsapp,
          birthDate: birthDate || undefined,
          professionalId,
          serviceIds: [serviceId],
          startsAt,
        }),
      }),
    onSuccess: () => setStep(4),
  });

  const titles = [
    "Escolha seu serviço",
    "Com quem você quer atender?",
    "Escolha o dia e o horário",
    "Seus dados",
    "Tudo certo!",
  ];

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId],
  );

  const openDates = shop?.openDates || [];
  const slots = availability?.slots || [];
  const selectedSlotLabel = slots.find((s) => s.startsAt === startsAt)?.label;

  return (
    <main className="min-h-screen bg-[#171715] p-5 text-white">
      <div className="mx-auto max-w-xl py-8">
        <p className="text-center font-display text-3xl tracking-widest">
          VOLTTA<sup className="text-xs">™</sup>
        </p>
        <div className="mt-8 rounded-xl bg-[#f7f6f2] p-6 text-[#1d1d1b] md:p-9">
          <p className="text-xs font-bold tracking-[.18em] text-[#9b7a44]">
            {shop?.name?.toUpperCase() || "AGENDAMENTO"}
          </p>
          <h1 className="mt-2 font-display text-4xl">
            {shopError ? "Barbearia não encontrada" : titles[step]}
          </h1>

          {shopLoading && (
            <p className="mt-6 text-sm text-neutral-500">Carregando...</p>
          )}

          {shopError && (
            <div className="mt-6 space-y-3">
              <p className="text-neutral-700">
                Não encontramos um negócio com o link{" "}
                <span className="font-mono text-sm">/agendar/{slug}</span>.
              </p>
            </div>
          )}

          {!shopLoading && !shopError && step === 0 && (
            <div className="mt-6 space-y-3">
              {!services.length && (
                <p className="text-sm text-neutral-500">
                  Nenhum serviço disponível no momento.
                </p>
              )}
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setServiceId(s.id);
                    setStep(1);
                  }}
                  className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 text-left hover:border-[#c4a574]"
                >
                  <span>
                    <span className="block font-semibold">{s.name}</span>
                    <span className="text-sm text-neutral-500">
                      {s.durationMinutes} min
                    </span>
                  </span>
                  <span className="font-bold">
                    R$ {Number(s.price).toFixed(2).replace(".", ",")}
                  </span>
                </button>
              ))}
            </div>
          )}

          {!shopError && step === 1 && (
            <div className="mt-6 space-y-3">
              {professionals.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProfessionalId(p.id);
                    setSelectedDate("");
                    setStartsAt("");
                    setStep(2);
                  }}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-left font-semibold hover:border-[#c4a574]"
                >
                  {p.name}
                </button>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setStep(0)}>
                VOLTAR
              </Button>
            </div>
          )}

          {!shopError && step === 2 && (
            <div className="mt-6 space-y-5">
              <p className="text-sm text-neutral-600">
                {selectedService?.name}
                {selectedService
                  ? ` · ${selectedService.durationMinutes} min`
                  : ""}
              </p>

              <div>
                <p className="mb-2 text-sm font-semibold">Dia</p>
                {!openDates.length ? (
                  <p className="text-sm text-neutral-500">
                    Nenhum dia de funcionamento configurado.
                  </p>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {openDates.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setSelectedDate(d);
                          setStartsAt("");
                        }}
                        className={`min-w-[5.5rem] shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold ${
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
                  <p className="mb-2 text-sm font-semibold">Horários disponíveis</p>
                  {loadingSlots ? (
                    <p className="text-sm text-neutral-500">Buscando horários...</p>
                  ) : !slots.length ? (
                    <p className="text-sm text-neutral-500">
                      Nenhum horário livre neste dia.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
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

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep(1)}
                >
                  VOLTAR
                </Button>
                <Button
                  className="w-full"
                  disabled={!startsAt}
                  onClick={() => setStep(3)}
                >
                  CONTINUAR
                </Button>
              </div>
            </div>
          )}

          {!shopError && step === 3 && (
            <div className="mt-6 space-y-4">
              <p className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                {selectedDate
                  ? formatDayLabel(selectedDate)
                  : ""}
                {selectedSlotLabel ? ` · ${selectedSlotLabel}` : ""}
              </p>
              <div>
                <Label>Seu nome</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>WhatsApp</Label>
                <Input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="11999999999"
                />
              </div>
              <div>
                <Label>Data de aniversário (opcional)</Label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep(2)}
                >
                  VOLTAR
                </Button>
                <Button
                  className="w-full"
                  disabled={!name || !whatsapp || book.isPending || book.isSuccess}
                  onClick={() => {
                    if (book.isPending || book.isSuccess) return;
                    book.mutate();
                  }}
                >
                  {book.isPending ? "ENVIANDO..." : "CONFIRMAR"}
                </Button>
              </div>
              {book.isError && (
                <p className="text-sm text-red-600">
                  {(book.error as Error).message}
                </p>
              )}
            </div>
          )}

          {!shopError && step === 4 && (
            <div className="mt-6 space-y-3">
              <p className="text-neutral-700">
                Seu horário foi reservado. Você receberá a confirmação no
                WhatsApp quando o negócio estiver conectado.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
