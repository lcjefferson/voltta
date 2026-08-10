"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AgendarIndexPage() {
  const router = useRouter();
  const { user, hydrated, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (user?.companySlug) {
      router.replace(`/agendar/${user.companySlug}`);
    }
  }, [hydrated, user?.companySlug, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#171715] p-6 text-white">
      <div className="max-w-md text-center">
        <p className="font-display text-3xl tracking-widest">
          VOLTTA<sup className="text-xs">™</sup>
        </p>
        <h1 className="mt-6 font-display text-4xl">Link incompleto</h1>
        <p className="mt-3 text-white/70">
          O agendamento público precisa do slug da barbearia, no formato{" "}
          <span className="font-mono text-[#c4a574]">/agendar/nome-da-barbearia</span>.
        </p>
        <p className="mt-3 text-sm text-white/50">
          Se você é o dono, abra a Agenda no painel e use o botão Copiar link.
        </p>
        <Link
          href="/agenda"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-[#c4a574] px-5 text-sm font-bold text-[#171715]"
        >
          IR PARA A AGENDA
        </Link>
      </div>
    </main>
  );
}
