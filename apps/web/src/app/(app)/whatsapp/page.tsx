"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MessageCircle, RefreshCw, Unplug } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageTitle } from "@/components/app-page";

type Connection = {
  status: string;
  provider?: string;
  connected?: boolean;
  qrcode?: string | null;
  paircode?: string | null;
  profileName?: string | null;
  instanceName?: string | null;
  webhookUrl?: string | null;
  webhookRegistered?: boolean | null;
};

function qrImageSrc(qrcode?: string | null) {
  if (!qrcode) return null;
  return qrcode.startsWith("data:") ? qrcode : `data:image/png;base64,${qrcode}`;
}

export default function WhatsappPage() {
  const qc = useQueryClient();
  const [testTo, setTestTo] = useState("");
  const [testText, setTestText] = useState(
    "Olá! Teste de mensagem da VOLTTA™.",
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["whatsapp-connection"],
    queryFn: () => api<Connection>("/whatsapp/connection"),
    refetchInterval: (query) =>
      query.state.data?.status === "CONNECTING" ? 4000 : false,
  });

  const connect = useMutation({
    mutationFn: () => api<Connection>("/whatsapp/connection", { method: "POST", body: "{}" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp-connection"] }),
  });

  const disconnect = useMutation({
    mutationFn: () => api("/whatsapp/connection", { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp-connection"] }),
  });

  const refreshQr = useMutation({
    mutationFn: () => api<Connection>("/whatsapp/connection/qr"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp-connection"] }),
  });

  const test = useMutation({
    mutationFn: () =>
      api("/whatsapp/test-message", {
        method: "POST",
        body: JSON.stringify({ to: testTo, text: testText }),
      }),
  });

  const reRegisterWebhook = useMutation({
    mutationFn: () =>
      api<{ webhookRegistered: boolean; webhookUrl: string }>(
        "/whatsapp/connection/webhook",
        { method: "POST", body: "{}" },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp-connection"] }),
  });

  useEffect(() => {
    if (data?.status === "CONNECTING") {
      const t = setInterval(() => void refetch(), 4000);
      return () => clearInterval(t);
    }
  }, [data?.status, refetch]);

  const qrSrc = qrImageSrc(data?.qrcode);

  return (
    <>
      <PageTitle eyebrow="CANAIS" title="WHATSAPP" />
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Card className="max-w-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <MessageCircle className="size-9 text-[#25D366]" />
              <h2 className="mt-5 text-xl font-bold">
                Conecte seu WhatsApp Business
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-neutral-500">
                Integração via{" "}
                <a
                  className="font-semibold text-[#9b7a44] underline"
                  href="https://docs.uazapi.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Uazapi
                </a>
                . Escaneie o QR Code com o WhatsApp Business do seu negócio.
              </p>
            </div>
            <Badge className="w-fit shrink-0">
              {data?.status || (isLoading ? "..." : "DISCONNECTED")}
            </Badge>
          </div>

          {data?.profileName && (
            <p className="mt-4 text-sm text-neutral-600">
              Perfil: <strong>{data.profileName}</strong>
              {data.instanceName ? ` · ${data.instanceName}` : ""}
            </p>
          )}

          {data?.connected && (
            <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm">
              <p className="font-semibold text-neutral-800">
                Captação de leads
                {data.webhookRegistered === true
                  ? " · webhook OK"
                  : data.webhookRegistered === false
                    ? " · webhook com falha"
                    : ""}
              </p>
              <p className="mt-1 text-neutral-500">
                Quem mandar mensagem no WhatsApp entra em{" "}
                <strong>Leads</strong> (se ainda não for cliente). Abra a página
                Leads após o teste.
              </p>
              {data.webhookUrl && (
                <p className="mt-2 break-all font-mono text-[11px] text-neutral-400">
                  {data.webhookUrl}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full sm:w-auto"
                disabled={reRegisterWebhook.isPending}
                onClick={() => reRegisterWebhook.mutate()}
              >
                {reRegisterWebhook.isPending
                  ? "REATIVANDO..."
                  : "REATIVAR WEBHOOK DE LEADS"}
              </Button>
              {reRegisterWebhook.isSuccess && (
                <p className="mt-2 text-sm text-emerald-700">
                  Webhook reativado. Envie uma mensagem de teste para o número
                  conectado.
                </p>
              )}
              {reRegisterWebhook.isError && (
                <p className="mt-2 text-sm text-red-600">
                  {(reRegisterWebhook.error as Error).message}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
            <Button
              className="w-full sm:w-auto"
              disabled={connect.isPending || data?.connected}
              onClick={() => connect.mutate()}
            >
              {connect.isPending ? "CONECTANDO..." : "CONECTAR WHATSAPP"}
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              disabled={refreshQr.isPending || !data?.instanceName}
              onClick={() => refreshQr.mutate()}
            >
              <RefreshCw className="mr-2 size-4" />
              ATUALIZAR QR
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              disabled={disconnect.isPending || data?.status === "DISCONNECTED"}
              onClick={() => disconnect.mutate()}
            >
              <Unplug className="mr-2 size-4" />
              DESCONECTAR
            </Button>
          </div>

          {(connect.error || disconnect.error || refreshQr.error) && (
            <p className="mt-4 text-sm text-red-600">
              {(
                (connect.error || disconnect.error || refreshQr.error) as Error
              ).message}
            </p>
          )}
        </Card>

        <Card>
          <h3 className="font-bold">QR Code</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Abra o WhatsApp → Aparelhos conectados → Conectar aparelho.
          </p>
          <div className="mt-5 flex min-h-56 items-center justify-center rounded-lg bg-neutral-100 p-4">
            {qrSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrSrc} alt="QR Code WhatsApp" className="max-h-56 max-w-full w-auto" />
            ) : data?.connected ? (
              <p className="text-sm font-semibold text-green-700">
                WhatsApp conectado
              </p>
            ) : (
              <p className="text-sm text-neutral-500">
                Clique em conectar para gerar o QR.
              </p>
            )}
          </div>
          {data?.paircode && (
            <p className="mt-3 text-sm">
              Código de pareamento: <strong>{data.paircode}</strong>
            </p>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-bold">Mensagem de teste</h3>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_2fr_auto]">
            <div>
              <Label>WhatsApp (DDD+número)</Label>
              <Input
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="5511999999999"
              />
            </div>
            <div>
              <Label>Mensagem</Label>
              <Input
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full lg:w-auto"
                disabled={!testTo || test.isPending || !data?.connected}
                onClick={() => test.mutate()}
              >
                ENVIAR
              </Button>
            </div>
          </div>
          {test.isSuccess && (
            <p className="mt-3 text-sm text-green-700">Mensagem enviada.</p>
          )}
          {test.isError && (
            <p className="mt-3 text-sm text-red-600">
              {(test.error as Error).message}
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
