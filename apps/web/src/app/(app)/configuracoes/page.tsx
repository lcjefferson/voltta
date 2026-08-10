"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { BookingLinkCard } from "@/components/booking-link-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/app-page";
import { api } from "@/lib/api";

type DayHours = { open: string; close: string } | null;
type BusinessHours = {
  slotIntervalMinutes: number;
  days: Record<string, DayHours>;
};

type Company = {
  name: string;
  slug: string;
  phone?: string | null;
  businessHours: BusinessHours;
};

const DAY_LABELS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const DEFAULT_HOURS: BusinessHours = {
  slotIntervalMinutes: 30,
  days: {
    "0": null,
    "1": { open: "09:00", close: "19:00" },
    "2": { open: "09:00", close: "19:00" },
    "3": { open: "09:00", close: "19:00" },
    "4": { open: "09:00", close: "19:00" },
    "5": { open: "09:00", close: "19:00" },
    "6": { open: "09:00", close: "18:00" },
  },
};

export default function ConfiguracoesPage() {
  const qc = useQueryClient();
  const { data: company } = useQuery({
    queryKey: ["company"],
    queryFn: () => api<Company>("/company"),
  });

  const { register, handleSubmit } = useForm({
    values: {
      companyName: company?.name || "",
      phone: company?.phone || "",
    },
  });

  const [hours, setHours] = useState<BusinessHours>(DEFAULT_HOURS);

  useEffect(() => {
    if (company?.businessHours) setHours(company.businessHours);
  }, [company?.businessHours]);

  const save = useMutation({
    mutationFn: (payload: {
      name: string;
      phone: string;
      businessHours: BusinessHours;
    }) =>
      api("/company", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company"] });
    },
  });

  function toggleDay(day: string, open: boolean) {
    setHours((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: open ? { open: "09:00", close: "19:00" } : null,
      },
    }));
  }

  function setDayTime(
    day: string,
    field: "open" | "close",
    value: string,
  ) {
    setHours((prev) => {
      const current = prev.days[day];
      if (!current) return prev;
      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: { ...current, [field]: value },
        },
      };
    });
  }

  return (
    <>
      <PageTitle eyebrow="CONTA" title="CONFIGURAÇÕES" />
      <div className="grid max-w-2xl gap-5">
        <BookingLinkCard />

        <Card>
          <h2 className="font-bold">Dados da barbearia</h2>
          <form
            className="mt-5 space-y-4"
            onSubmit={handleSubmit((v) =>
              save.mutate({
                name: v.companyName,
                phone: v.phone,
                businessHours: hours,
              }),
            )}
          >
            <div>
              <Label>Nome</Label>
              <Input {...register("companyName", { required: true })} />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input {...register("phone")} placeholder="(11) 99999-9999" />
            </div>
            {company?.slug && (
              <p className="text-sm text-neutral-500">
                Slug do link: <span className="font-mono">{company.slug}</span>
              </p>
            )}

            <div className="border-t border-neutral-200 pt-5">
              <h3 className="font-bold">Horário de funcionamento</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Usado no link público para mostrar só os horários disponíveis.
              </p>

              <div className="mt-4">
                <Label>Intervalo entre horários (minutos)</Label>
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={hours.slotIntervalMinutes}
                  onChange={(e) =>
                    setHours((prev) => ({
                      ...prev,
                      slotIntervalMinutes: Number(e.target.value) || 30,
                    }))
                  }
                />
              </div>

              <div className="mt-4 space-y-3">
                {DAY_LABELS.map((label, index) => {
                  const key = String(index);
                  const day = hours.days[key];
                  const open = !!day;
                  return (
                    <div
                      key={key}
                      className="rounded-lg border border-neutral-200 bg-neutral-50 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-sm font-semibold">
                          <input
                            type="checkbox"
                            checked={open}
                            onChange={(e) => toggleDay(key, e.target.checked)}
                          />
                          {label}
                        </label>
                        {!open && (
                          <span className="text-xs text-neutral-400">
                            Fechado
                          </span>
                        )}
                      </div>
                      {open && day && (
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div>
                            <Label>Abre</Label>
                            <Input
                              type="time"
                              value={day.open}
                              onChange={(e) =>
                                setDayTime(key, "open", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label>Fecha</Label>
                            <Input
                              type="time"
                              value={day.close}
                              onChange={(e) =>
                                setDayTime(key, "close", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {save.isError && (
              <p className="text-sm text-red-600">
                {(save.error as Error).message}
              </p>
            )}
            {save.isSuccess && (
              <p className="text-sm text-emerald-700">Configurações salvas.</p>
            )}
            <Button disabled={save.isPending}>
              {save.isPending ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
