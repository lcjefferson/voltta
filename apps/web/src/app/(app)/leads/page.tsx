"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTitle } from "@/components/app-page";

type Lead = {
  id: string;
  name: string;
  whatsapp?: string | null;
  phone?: string | null;
  lastInboundAt?: string | null;
  lastInboundMessage?: string | null;
  source?: string;
};

type LeadsResponse = { data: Lead[]; total: number };

export default function LeadsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["leads"],
    queryFn: () => api<LeadsResponse>("/leads?limit=100"),
  });
  const leads = data?.data ?? [];

  const convert = useMutation({
    mutationFn: (id: string) =>
      api(`/customers/${id}/convert`, { method: "POST", body: "{}" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  return (
    <>
      <PageTitle eyebrow="CRM" title="LEADS" />
      <Card>
        <div className="mb-5 flex justify-between gap-3">
          <div>
            <h2 className="font-bold">Contatos via WhatsApp</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Quem manda mensagem vira lead. Ao agendar, vira cliente
              automaticamente.
            </p>
          </div>
          <Badge>{data?.total ?? leads.length} leads</Badge>
        </div>
        <div className="divide-y">
          {leads.length ? (
            leads.map((lead) => (
              <div
                className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between"
                key={lead.id}
              >
                <div>
                  <p className="font-semibold">{lead.name}</p>
                  <p className="text-sm text-neutral-500">
                    {lead.whatsapp || lead.phone || "Sem WhatsApp"}
                  </p>
                  {lead.lastInboundMessage && (
                    <p className="mt-1 max-w-xl text-sm text-neutral-600">
                      “{lead.lastInboundMessage}”
                    </p>
                  )}
                  <p className="mt-1 text-xs text-neutral-400">
                    {lead.lastInboundAt
                      ? new Date(lead.lastInboundAt).toLocaleString("pt-BR")
                      : "Sem mensagem recente"}
                    {lead.source ? ` · ${lead.source}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={convert.isPending}
                    onClick={() => convert.mutate(lead.id)}
                  >
                    VIRAR CLIENTE
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="py-10 text-center text-sm text-neutral-500">
              Nenhum lead ainda. Quando alguém falar no WhatsApp conectado, aparece
              aqui.
            </p>
          )}
        </div>
      </Card>
    </>
  );
}
