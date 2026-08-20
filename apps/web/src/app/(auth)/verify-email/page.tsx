"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const patchUser = useAuthStore((s) => s.patchUser);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Confirmando seu e-mail...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Link inválido ou incompleto.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await api<{ message: string }>("/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token }),
        });
        if (cancelled) return;
        patchUser({ emailVerified: true });
        setStatus("ok");
        setMessage(data.message || "E-mail confirmado com sucesso.");
        setTimeout(() => router.push("/dashboard"), 1800);
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Não foi possível confirmar.",
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, patchUser, router]);

  return (
    <div className="mt-8 space-y-4">
      <p
        className={
          status === "error"
            ? "text-sm text-red-600"
            : status === "ok"
              ? "text-sm text-emerald-700"
              : "text-sm text-neutral-600"
        }
      >
        {message}
      </p>
      {status === "error" && (
        <div className="space-y-2">
          <Link
            href="/login"
            className="block text-center text-sm font-bold text-[#9b7a44]"
          >
            Ir para o login
          </Link>
          <p className="text-center text-xs text-neutral-500">
            Se já estiver logado, use o banner no app para reenviar o e-mail.
          </p>
        </div>
      )}
      {status === "ok" && (
        <Button className="w-full" onClick={() => router.push("/dashboard")}>
          IR PARA O APP
        </Button>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-x-clip bg-[#f7f6f2] p-4 sm:p-6">
      <div className="w-full min-w-0 max-w-sm">
        <Link href="/" className="font-display text-2xl tracking-[.12em] sm:text-3xl sm:tracking-widest">
          VOLTTA™
        </Link>
        <p className="mt-12 text-xs font-bold tracking-[.2em] text-[#9b7a44]">
          CONFIRMAÇÃO
        </p>
        <h1 className="mt-2 font-display text-[clamp(1.75rem,8vw,3rem)] leading-none">
          E-MAIL.
        </h1>
        <Suspense
          fallback={
            <p className="mt-8 text-sm text-neutral-500">Carregando...</p>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </main>
  );
}
