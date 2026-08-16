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

type RoleCode = "ADMIN" | "BARBEIRO" | "RECEPCIONISTA";

type User = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  isProfessional: boolean;
  role: { code: RoleCode; name: string };
};

type CreateForm = {
  name: string;
  email: string;
  password: string;
  role: RoleCode;
  isProfessional: boolean;
};

type EditForm = {
  name: string;
  role: RoleCode;
  isProfessional: boolean;
  password?: string;
};

const roleLabel: Record<RoleCode, string> = {
  ADMIN: "Admin",
  BARBEIRO: "Profissional",
  RECEPCIONISTA: "Recepcionista",
};

export default function ProfissionaisPage() {
  const qc = useQueryClient();
  const { confirm } = useFeedback();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => api<User[]>("/users"),
  });

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    watch: watchCreate,
    setValue: setCreateValue,
  } = useForm<CreateForm>({
    defaultValues: {
      role: "BARBEIRO",
      isProfessional: true,
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    watch: watchEdit,
    setValue: setEditValue,
  } = useForm<EditForm>();

  const createRole = watchCreate("role");
  const editRole = watchEdit("role");
  const activePros = users.filter((u) => u.isActive && u.isProfessional).length;
  const atLimit = activePros >= 5;

  const create = useMutation({
    mutationFn: (v: CreateForm) =>
      api("/users", {
        method: "POST",
        body: JSON.stringify({
          name: v.name,
          email: v.email,
          password: v.password,
          role: v.role,
          isProfessional: v.isProfessional,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      resetCreate({
        name: "",
        email: "",
        password: "",
        role: "BARBEIRO",
        isProfessional: true,
      });
    },
  });

  const update = useMutation({
    mutationFn: (payload: EditForm & { id: string }) =>
      api(`/users/${payload.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: payload.name,
          role: payload.role,
          isProfessional: payload.isProfessional,
          ...(payload.password?.trim()
            ? { password: payload.password.trim() }
            : {}),
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setEditingId(null);
    },
  });

  const deactivate = useMutation({
    mutationFn: (id: string) =>
      api(`/users/${id}/deactivate`, { method: "PATCH" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setEditingId(null);
    },
  });

  const reactivate = useMutation({
    mutationFn: (id: string) =>
      api(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: true }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const toggleProfessional = useMutation({
    mutationFn: ({
      id,
      isProfessional,
    }: {
      id: string;
      isProfessional: boolean;
    }) =>
      api(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isProfessional }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  function startEdit(u: User) {
    setEditingId(u.id);
    resetEdit({
      name: u.name,
      role: u.role.code,
      isProfessional: u.isProfessional,
      password: "",
    });
  }

  return (
    <>
      <PageTitle eyebrow="EQUIPE" title="PROFISSIONAIS">
        <p className="text-sm text-neutral-500">
          {activePros}/5 profissionais ativos no plano
        </p>
      </PageTitle>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-bold">Equipe do negócio</h2>
            <span className="text-sm text-neutral-500">
              {users.length} {users.length === 1 ? "pessoa" : "pessoas"}
            </span>
          </div>

          <div className="divide-y">
            {isLoading ? (
              <p className="py-10 text-center text-sm text-neutral-500">
                Carregando equipe...
              </p>
            ) : users.length ? (
              users.map((u) => (
                <div className="py-4" key={u.id}>
                  {editingId === u.id ? (
                    <form
                      className="space-y-3"
                      onSubmit={handleEditSubmit((v) =>
                        update.mutate({ ...v, id: u.id }),
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
                          <Label>Papel</Label>
                          <select
                            className="flex h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
                            {...registerEdit("role", {
                              onChange: (e) => {
                                const next = e.target.value as RoleCode;
                                if (next === "BARBEIRO") {
                                  setEditValue("isProfessional", true);
                                }
                              },
                            })}
                          >
                            <option value="BARBEIRO">Profissional</option>
                            <option value="RECEPCIONISTA">Recepcionista</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <Label>Nova senha (opcional)</Label>
                          <Input
                            type="password"
                            placeholder="Deixe em branco para manter"
                            {...registerEdit("password", { minLength: 6 })}
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="size-4 accent-[#c4a574]"
                          {...registerEdit("isProfessional")}
                          disabled={
                            !u.isProfessional &&
                            atLimit &&
                            editRole !== "BARBEIRO"
                          }
                        />
                        Aparece na agenda / agendamento online
                      </label>
                      <p className="text-xs text-neutral-500">
                        Login: {u.email}
                      </p>
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
                        {u.isActive && (
                          <Button
                            type="button"
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                            disabled={deactivate.isPending}
                            onClick={async () => {
                              const ok = await confirm({
                                title: "Desativar profissional",
                                message: `Desativar ${u.name}?`,
                                confirmLabel: "DESATIVAR",
                                tone: "danger",
                              });
                              if (ok) deactivate.mutate(u.id);
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
                          <p className="font-semibold">{u.name}</p>
                          {!u.isActive && (
                            <Badge className="bg-neutral-200 text-neutral-600">
                              Inativo
                            </Badge>
                          )}
                          {u.isProfessional && u.isActive && (
                            <Badge>Na agenda</Badge>
                          )}
                        </div>
                        <p className="truncate text-sm text-neutral-500">
                          {u.email}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {roleLabel[u.role.code] ?? u.role.name}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 px-3 text-xs"
                          onClick={() => startEdit(u)}
                        >
                          EDITAR
                        </Button>
                        {u.isActive && (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 px-3 text-xs"
                            disabled={
                              toggleProfessional.isPending ||
                              (!u.isProfessional && atLimit)
                            }
                            onClick={() =>
                              toggleProfessional.mutate({
                                id: u.id,
                                isProfessional: !u.isProfessional,
                              })
                            }
                          >
                            {u.isProfessional
                              ? "Tirar da agenda"
                              : "Colocar na agenda"}
                          </Button>
                        )}
                        {u.isActive ? (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 px-3 text-xs text-red-700"
                            disabled={deactivate.isPending}
                            onClick={async () => {
                              const ok = await confirm({
                                title: "Desativar profissional",
                                message: `Desativar ${u.name}?`,
                                confirmLabel: "DESATIVAR",
                                tone: "danger",
                              });
                              if (ok) deactivate.mutate(u.id);
                            }}
                          >
                            Desativar
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 px-3 text-xs"
                            disabled={
                              reactivate.isPending ||
                              (u.isProfessional && atLimit)
                            }
                            onClick={() => reactivate.mutate(u.id)}
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
                Nenhum profissional cadastrado ainda.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-bold">Novo profissional</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Cada profissional entra na agenda e no agendamento online.
          </p>

          {atLimit && (
            <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Limite de 5 profissionais ativos atingido. Desative um para
              adicionar outro na agenda.
            </p>
          )}

          <form
            className="mt-5 space-y-3"
            onSubmit={handleCreateSubmit((v) => create.mutate(v))}
          >
            <div>
              <Label>Nome</Label>
              <Input
                placeholder="João Silva"
                {...registerCreate("name", { required: true })}
              />
            </div>
            <div>
              <Label>E-mail (login)</Label>
              <Input
                type="email"
                placeholder="joao@estudio.com"
                {...registerCreate("email", { required: true })}
              />
            </div>
            <div>
              <Label>Senha inicial</Label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                {...registerCreate("password", {
                  required: true,
                  minLength: 6,
                })}
              />
            </div>
            <div>
              <Label>Papel</Label>
              <select
                className="flex h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
                {...registerCreate("role", {
                  onChange: (e) => {
                    const next = e.target.value as RoleCode;
                    if (next === "BARBEIRO") {
                      setCreateValue("isProfessional", true);
                    }
                  },
                })}
              >
                <option value="BARBEIRO">Profissional</option>
                <option value="RECEPCIONISTA">Recepcionista</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-[#c4a574]"
                {...registerCreate("isProfessional")}
                disabled={atLimit && createRole === "RECEPCIONISTA"}
              />
              Aparece na agenda / agendamento online
            </label>
            <Button
              className="w-full"
              disabled={
                create.isPending ||
                (atLimit && watchCreate("isProfessional"))
              }
            >
              {create.isPending ? "Salvando..." : "ADICIONAR À EQUIPE"}
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
