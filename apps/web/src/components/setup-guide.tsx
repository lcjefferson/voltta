"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GUIDES, SETUP_GOAL, setupDoneCount } from "@/lib/help";
import { useSetupProgress } from "@/hooks/use-setup-progress";
import { startProductTour } from "@/components/product-tour";
import { cn } from "@/lib/utils";

export function SetupGuide({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { progress, isLoading } = useSetupProgress();
  const [openId, setOpenId] = useState<string | null>(compact ? null : "catalog");
  const done = setupDoneCount(progress);

  if (isLoading && compact) return null;
  if (compact && progress.tourCompleted && done >= SETUP_GOAL) return null;

  return (
    <Card className={compact ? "mb-5 border-[#c4a574]/50 bg-[#fbf8f2]" : ""}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-[.18em] text-[#9b7a44]">
            {compact ? "PRIMEIROS PASSOS" : "COMO USAR A VOLTTA"}
          </p>
          <h2 className="mt-1 font-display text-2xl leading-none sm:text-3xl">
            {compact ? "DEIXA A GENTE TE LEVAR" : "GUIA DO APP"}
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            {compact
              ? "Tour de 1 minuto, depois os passos de verdade: serviço, cliente, WhatsApp."
              : "Passo a passo para computador e celular. Cada guia abre a tela certa. O check aparece quando aquilo já está feito na sua conta."}
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-[#80622f]">
          {done}/{SETUP_GOAL} prontos
        </p>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-[#c4a574] transition-all"
          style={{ width: `${(done / SETUP_GOAL) * 100}%` }}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={() => startProductTour()}
        >
          {progress.tourCompleted ? "REVER O TOUR" : "COMEÇAR O TOUR"}
        </Button>
        {compact ? (
          <Link
            href="/onboarding"
            className="inline-flex h-11 w-full max-w-full items-center justify-center rounded-md border border-current px-4 text-sm font-bold sm:w-auto"
          >
            VER O GUIA COMPLETO
          </Link>
        ) : null}
      </div>

      {compact ? null : (
        <div className="mt-5 divide-y rounded-xl border border-neutral-200 bg-white">
          {GUIDES.map((guide) => {
            const complete = progress[guide.doneKey];
            const expanded = openId === guide.id;
            return (
              <div key={guide.id} className="min-w-0">
                <button
                  type="button"
                  className="flex w-full items-start gap-3 px-3 py-3 text-left sm:px-4"
                  onClick={() =>
                    setOpenId(expanded ? null : guide.id)
                  }
                  aria-expanded={expanded}
                >
                  {complete ? (
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#a58450]" />
                  ) : (
                    <Circle className="mt-0.5 size-5 shrink-0 text-neutral-300" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{guide.title}</span>
                    <span className="mt-0.5 block text-sm text-neutral-500">
                      {guide.blurb}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "mt-1 size-4 shrink-0 text-neutral-400 transition",
                      expanded && "rotate-180",
                    )}
                  />
                </button>
                {expanded ? (
                  <div className="space-y-3 px-3 pb-4 sm:px-4">
                    <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-neutral-600">
                      {guide.steps.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                    <Link
                      href={guide.href}
                      className="inline-flex h-11 w-full max-w-full items-center justify-center rounded-md bg-[#c4a574] px-4 text-sm font-bold text-[#171715] sm:w-auto"
                    >
                      {guide.cta}
                    </Link>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
