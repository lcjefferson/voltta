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
import { useAuthStore } from "@/lib/auth-store";

type DayBreak = { start: string; end: string };
type DayHours = {
  open: string;
  close: string;
  break?: DayBreak | null;
} | null;
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

type Profile = {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  role: string;
  companyId: string;
  companyName: string;
  companySlug: string;
  companyPhone?: string | null;
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
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const authUser = useAuthStore((s) => s.user);

  const { data: company } = useQuery({
    queryKey: ["company"],
    queryFn: () => api<Company>("/company"),
  });

  const { data: profile } = useQuery({
    queryKey: ["auth-me"],
    queryFn: () => api<Profile>("/auth/me"),
  });

  const { register, handleSubmit } = useForm({
    values: {
      companyName: company?.name || "",
      phone: company?.phone || "",
    },
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    watch: watchProfile,
    reset: resetProfile,
    formState: { isDirty: profileDirty },
  } = useForm({
    values: {
      name: profile?.name || "",
      email: profile?.email || "",
      currentPassword: "",
    },
  });

  const profileEmail = watchProfile("email");
  const emailChanging =
    !!profile?.email &&
    !!profileEmail &&
    profileEmail.toLowerCase().trim() !== profile.email.toLowerCase();

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

  const saveProfile = useMutation({
    mutationFn: (payload: {
      name: string;
      email: string;
      currentPassword?: string;
    }) =>
      api<Profile>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["auth-me"] });
      resetProfile({
        name: data.name,
        email: data.email,
        currentPassword: "",
      });
      if (accessToken && refreshToken) {
        setAuth(accessToken, refreshToken, {
          id: data.id,
          name: data.name,
          email: data.email,
          emailVerified: data.emailVerified,
          role: data.role,
          companyId: data.companyId,
          companyName: data.companyName,
          companySlug: data.companySlug,
        });
      } else if (authUser) {
        localStorage.setItem(
          "voltta_user",
          JSON.stringify({
            ...authUser,
            name: data.name,
            email: data.email,
            emailVerified: data.emailVerified,
          }),
        );
      }
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
      const next = { ...current, [field]: value };
      // Se a pausa ficar inválida após mudar o expediente, remove.
      if (next.break) {
        const openM = toMinutes(next.open);
        const closeM = toMinutes(next.close);
        const startM = toMinutes(next.break.start);
        const endM = toMinutes(next.break.end);
        if (!(startM < endM && startM >= openM && endM <= closeM)) {
          next.break = null;
        }
      }
      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: next,
        },
      };
    });
  }

  function toggleLunch(day: string, enabled: boolean) {
    setHours((prev) => {
      const current = prev.days[day];
      if (!current) return prev;
      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: {
            ...current,
            break: enabled ? { start: "12:00", end: "13:00" } : null,
          },
        },
      };
    });
  }

  function setLunchTime(
    day: string,
    field: "start" | "end",
    value: string,
  ) {
    setHours((prev) => {
      const current = prev.days[day];
      if (!current?.break) return prev;
      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: {
            ...current,
            break: { ...current.break, [field]: value },
          },
        },
      };
    });
  }

  function toMinutes(hhmm: string) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }

  return (
    <>
      <PageTitle eyebrow="CONTA" title="CONFIGURAÇÕES" />
      <div className="grid max-w-2xl gap-5">
        <BookingLinkCard />

        <Card>
          <h2 className="font-bold">Conta de acesso</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Nome e e-mail usados no login e na recuperação de senha.
          </p>
          <form
            className="mt-5 space-y-4"
            onSubmit={handleSubmitProfile((v) =>
              saveProfile.mutate({
                name: v.name,
                email: v.email,
                ...(emailChanging
                  ? { currentPassword: v.currentPassword }
                  : {}),
              }),
            )}
          >
            <div>
              <Label>Seu nome</Label>
              <Input {...registerProfile("name", { required: true })} />
            </div>
            <div>
              <Label>E-mail de login / contato</Label>
              <Input
                type="email"
                {...registerProfile("email", { required: true })}
                autoComplete="email"
              />
            </div>
            {emailChanging && (
              <div>
                <Label>Senha atual (para confirmar a troca de e-mail)</Label>
                <Input
                  type="password"
                  {...registerProfile("currentPassword", {
                    required: emailChanging,
                  })}
                  autoComplete="current-password"
                />
              </div>
            )}
            {saveProfile.isError && (
              <p className="text-sm text-red-600">
                {(saveProfile.error as Error).message}
              </p>
            )}
            {saveProfile.isSuccess && (
              <p className="text-sm text-emerald-700">Conta atualizada.</p>
            )}
            <Button disabled={saveProfile.isPending || !profileDirty}>
              {saveProfile.isPending ? "SALVANDO..." : "SALVAR CONTA"}
            </Button>
          </form>
        </Card>

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
                A pausa de almoço remove os slots desse intervalo.
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
                        <div className="mt-3 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
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

                          <div className="rounded-md border border-dashed border-neutral-300 bg-white p-3">
                            <label className="flex items-center gap-2 text-sm font-semibold">
                              <input
                                type="checkbox"
                                checked={!!day.break}
                                onChange={(e) =>
                                  toggleLunch(key, e.target.checked)
                                }
                              />
                              Pausa para almoço
                            </label>
                            {day.break ? (
                              <div className="mt-3 grid grid-cols-2 gap-3">
                                <div>
                                  <Label>Início</Label>
                                  <Input
                                    type="time"
                                    value={day.break.start}
                                    onChange={(e) =>
                                      setLunchTime(
                                        key,
                                        "start",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>Fim</Label>
                                  <Input
                                    type="time"
                                    value={day.break.end}
                                    onChange={(e) =>
                                      setLunchTime(key, "end", e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                            ) : (
                              <p className="mt-2 text-xs text-neutral-500">
                                Sem pausa — agenda contínua no dia.
                              </p>
                            )}
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
