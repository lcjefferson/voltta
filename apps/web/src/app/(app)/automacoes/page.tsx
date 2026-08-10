"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Repeat2, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/app-page";

type RuleAction = { type?: string; template?: string };
type Rule = {
  id: string;
  name: string;
  trigger: string;
  isActive: boolean;
  actions: RuleAction[] | RuleAction | unknown;
  conditions?: Record<string, unknown>;
};

type Execution = {
  id: string;
  status: string;
  createdAt: string;
  errorMessage?: string | null;
  rule?: { name: string; trigger: string } | null;
  customer?: { name: string; whatsapp?: string | null } | null;
};

type FormValues = {
  name: string;
  trigger: string;
  template: string;
  isActive: boolean;
};

const TRIGGERS = [
  {
    value: "A1",
    label: "A1 — Confirmação (agendamento criado)",
    defaultTemplate:
      "Olá {{nome}}\nSeu horário está confirmado para {{data}} às {{hora}}.",
  },
  {
    value: "A2",
    label: "A2 — Lembrete 24h antes",
    defaultTemplate:
      "Olá {{nome}}\nLembrete: seu horário é amanhã, {{data}} às {{hora}}.",
  },
  {
    value: "A3",
    label: "A3 — Lembrete 2h antes",
    defaultTemplate:
      "Olá {{nome}}\nSeu horário é hoje às {{hora}}. Te esperamos!",
  },
  {
    value: "A4",
    label: "A4 — Campanha de retorno",
    defaultTemplate:
      "Olá {{nome}}\nEstá na hora de renovar seu visual.\nClique aqui: {{link}}",
  },
  {
    value: "A5",
    label: "A5 — Aniversário",
    defaultTemplate:
      "Olá {{nome}}\nFeliz aniversário! Que tal agendar um horário especial? {{link}}",
  },
  {
    value: "CUSTOM",
    label: "Personalizada",
    defaultTemplate: "Olá {{nome}}, temos uma novidade para você. {{link}}",
  },
] as const;

function getTemplate(rule?: Rule | null) {
  if (!rule) return TRIGGERS[0].defaultTemplate;
  const actions = Array.isArray(rule.actions)
    ? rule.actions
    : rule.actions
      ? [rule.actions as RuleAction]
      : [];
  return (
    actions[0]?.template ||
    TRIGGERS.find((t) => t.value === rule.trigger)?.defaultTemplate ||
    TRIGGERS[0].defaultTemplate
  );
}

function triggerLabel(trigger: string) {
  return TRIGGERS.find((t) => t.value === trigger)?.label || trigger;
}

export default function AutomacoesPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Rule | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["automation-rules"],
    queryFn: () => api<Rule[]>("/automations/rules"),
  });
  const { data: executions = [] } = useQuery({
    queryKey: ["automation-executions"],
    queryFn: () => api<Execution[]>("/automations/executions"),
  });

  const open = creating || !!editing;

  const defaults = useMemo<FormValues>(() => {
    if (editing) {
      return {
        name: editing.name,
        trigger: editing.trigger,
        template: getTemplate(editing),
        isActive: editing.isActive,
      };
    }
    return {
      name: "",
      trigger: "A1",
      template: TRIGGERS[0].defaultTemplate,
      isActive: true,
    };
  }, [editing, creating]);

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormValues>({
    values: defaults,
  });

  const selectedTrigger = watch("trigger");

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        name: values.name,
        trigger: values.trigger,
        template: values.template,
        isActive: values.isActive,
      };
      if (editing) {
        return api(`/automations/rules/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      return api("/automations/rules", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["automation-rules"] });
      setCreating(false);
      setEditing(null);
      reset();
    },
  });

  const toggle = useMutation({
    mutationFn: (rule: Rule) =>
      api(`/automations/rules/${rule.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !rule.isActive }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automation-rules"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/automations/rules/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automation-rules"] }),
  });

  return (
    <>
      <PageTitle eyebrow="RETENÇÃO" title="AUTOMAÇÕES">
        <Button
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          NOVA AUTOMAÇÃO
        </Button>
      </PageTitle>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && (
          <Card>
            <p className="text-sm text-neutral-500">Carregando automações...</p>
          </Card>
        )}
        {!isLoading &&
          rules.map((rule) => (
            <Card key={rule.id}>
              <Repeat2 className="size-5 text-[#a58450]" />
              <div className="mt-6 flex items-start justify-between gap-3">
                <h2 className="font-bold">{rule.name}</h2>
                <Badge>{rule.isActive ? "Ativa" : "Pausada"}</Badge>
              </div>
              <p className="mt-2 text-sm text-neutral-500">
                {triggerLabel(rule.trigger)}
              </p>
              <p className="mt-3 line-clamp-3 text-sm text-neutral-600">
                {getTemplate(rule)}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreating(false);
                    setEditing(rule);
                  }}
                >
                  <Pencil className="mr-2 size-4" />
                  EDITAR
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toggle.mutate(rule)}
                  disabled={toggle.isPending}
                >
                  {rule.isActive ? "PAUSAR" : "ATIVAR"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm("Remover esta automação?")) remove.mutate(rule.id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        {!isLoading && !rules.length && (
          <Card className="md:col-span-2 xl:col-span-3">
            <p className="text-sm text-neutral-500">
              Nenhuma automação cadastrada. Crie a primeira para começar a
              trazer clientes de volta.
            </p>
          </Card>
        )}
      </div>

      {open && (
        <Card className="mt-5 max-w-3xl">
          <h2 className="font-bold">
            {editing ? "Editar automação" : "Nova automação"}
          </h2>
          <form
            className="mt-5 grid gap-4"
            onSubmit={handleSubmit((values) => save.mutate(values))}
          >
            <div>
              <Label>Nome</Label>
              <Input
                {...register("name", { required: true })}
                placeholder="Ex.: Confirmação de agendamento"
              />
            </div>
            <div>
              <Label>Gatilho</Label>
              <select
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
                {...register("trigger", {
                  onChange: (e) => {
                    const found = TRIGGERS.find((t) => t.value === e.target.value);
                    if (found && !editing) setValue("template", found.defaultTemplate);
                  },
                })}
              >
                {TRIGGERS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Mensagem WhatsApp</Label>
              <textarea
                className="mt-1 min-h-32 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
                {...register("template", { required: true })}
              />
              <p className="mt-2 text-xs text-neutral-500">
                Variáveis: {"{{nome}}"} {"{{data}}"} {"{{hora}}"} {"{{link}}"}
                {selectedTrigger === "CUSTOM"
                  ? " · Gatilho personalizado (dispare via integrações futuras)"
                  : ""}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("isActive")} />
              Automação ativa
            </label>
            {(save.error || remove.error) && (
              <p className="text-sm text-red-600">
                {((save.error || remove.error) as Error).message}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button disabled={save.isPending}>
                {save.isPending ? "SALVANDO..." : "SALVAR AUTOMAÇÃO"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreating(false);
                  setEditing(null);
                }}
              >
                CANCELAR
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Execuções recentes</h2>
          <Badge>{executions.length}</Badge>
        </div>
        <div className="divide-y">
          {executions.length ? (
            executions.slice(0, 12).map((ex) => (
              <div
                key={ex.id}
                className="flex flex-col gap-1 py-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {ex.rule?.name || "Automação"} ·{" "}
                    {ex.customer?.name || "Cliente"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {new Date(ex.createdAt).toLocaleString("pt-BR")}
                    {ex.errorMessage ? ` · ${ex.errorMessage}` : ""}
                  </p>
                </div>
                <Badge>{ex.status}</Badge>
              </div>
            ))
          ) : (
            <p className="py-6 text-sm text-neutral-500">
              Nenhuma execução ainda. Crie um agendamento para disparar as
              regras ativas.
            </p>
          )}
        </div>
      </Card>
    </>
  );
}
