"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";

const WAIT_SECONDS = 5;

export default function ObrigadoPage() {
  const router = useRouter();
  const { accessToken, user, hydrated, hydrate } = useAuthStore();
  const [left, setLeft] = useState(WAIT_SECONDS);

  const nextHref = user?.trialLocked ? "/assinatura" : "/dashboard?tour=1";

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!accessToken) {
      router.replace("/login");
    }
  }, [hydrated, accessToken, router]);

  useEffect(() => {
    if (!hydrated || !accessToken) return;
    const tick = window.setInterval(() => {
      setLeft((n) => Math.max(0, n - 1));
    }, 1000);
    const go = window.setTimeout(() => {
      router.replace(nextHref);
    }, WAIT_SECONDS * 1000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(go);
    };
  }, [hydrated, accessToken, nextHref, router]);

  if (!hydrated || !accessToken) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#171715] p-4 text-sm text-white/70">
        Abrindo...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-x-clip bg-[#171715] p-4 sm:p-6">
      <div className="w-full min-w-0 max-w-md rounded-xl bg-[#f7f6f2] p-5 sm:p-7 md:p-10">
        <Link
          href="/"
          className="font-display text-2xl tracking-[.12em] sm:text-3xl sm:tracking-widest"
        >
          VOLTTA<sup className="text-xs">™</sup>
        </Link>
        <p className="mt-8 text-xs font-bold tracking-[.2em] text-[#9b7a44]">
          CONTA CRIADA
        </p>
        <h1 className="mt-2 font-display text-[clamp(1.75rem,8vw,3rem)] leading-none">
          OBRIGADO.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-neutral-600">
          Seu teste de 7 dias está liberado
          {user?.companyName ? ` para ${user.companyName}` : ""}. Em {left}{" "}
          {left === 1 ? "segundo" : "segundos"} você entra no sistema — e a
          gente te mostra o caminho.
        </p>
        <p className="mt-3 text-sm text-neutral-500">
          Confirme o e-mail quando o link chegar, para avisos e recuperação de
          senha.
        </p>
        <Button
          className="mt-7 w-full"
          onClick={() => router.replace(nextHref)}
        >
          ENTRAR AGORA
        </Button>
        <p className="mt-4 text-center text-xs text-neutral-500">
          Redirecionando automaticamente...
        </p>
      </div>
    </main>
  );
}
