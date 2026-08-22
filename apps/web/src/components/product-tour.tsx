"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { TOUR_STEPS } from "@/lib/help";
import {
  isTourDoneLocally,
  markTourDoneLocally,
} from "@/lib/tour-storage";
import { useOnboardingSetting } from "@/hooks/use-setup-progress";
import { useAuthStore } from "@/lib/auth-store";
import { useQueryClient } from "@tanstack/react-query";

const REPLAY_KEY = "voltta_tour_replay";
const START_EVENT = "voltta-tour-start";

export function startProductTour() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(REPLAY_KEY, "1");
  window.dispatchEvent(new Event(START_EVENT));
}

export function ProductTour({
  enabled,
}: {
  enabled: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.user?.companyId);
  const { data: onboarding, isLoading } = useOnboardingSetting({
    enabled,
  });
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [desktop, setDesktop] = useState(false);
  const autoStarted = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const finish = useCallback(
    async (skipped: boolean) => {
      sessionStorage.removeItem(REPLAY_KEY);
      setOpen(false);
      markTourDoneLocally(companyId);
      const nextValue = {
        ...(onboarding || {}),
        completed: true,
        skipped,
        tourCompletedAt: new Date().toISOString(),
      };
      qc.setQueryData(["onboarding"], nextValue);
      try {
        await api("/company/onboarding", {
          method: "PATCH",
          body: JSON.stringify({ value: nextValue }),
        });
        await qc.invalidateQueries({ queryKey: ["onboarding"] });
      } catch {
        /* localStorage already prevents repeat on this device */
      }
    },
    [companyId, onboarding, qc],
  );

  useEffect(() => {
    if (!enabled || isLoading || autoStarted.current) return;
    const params = new URLSearchParams(window.location.search);
    const forced =
      params.get("tour") === "1" || sessionStorage.getItem(REPLAY_KEY) === "1";
    const alreadyDone =
      onboarding?.completed === true || isTourDoneLocally(companyId);
    if (forced) {
      autoStarted.current = true;
      setStep(0);
      setOpen(true);
      if (params.get("tour") === "1") {
        params.delete("tour");
        const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
        router.replace(next);
      }
      return;
    }
    if (alreadyDone) return;
    if (onboarding?.completed === false) {
      autoStarted.current = true;
      setStep(0);
      setOpen(true);
    }
  }, [enabled, isLoading, onboarding?.completed, companyId, router]);

  useEffect(() => {
    const onStart = () => {
      setStep(0);
      setOpen(true);
    };
    window.addEventListener(START_EVENT, onStart);
    return () => window.removeEventListener(START_EVENT, onStart);
  }, []);

  const current = TOUR_STEPS[step];

  useEffect(() => {
    if (!open || !current) return;
    if (pathname !== current.href) {
      router.replace(current.href);
    }
  }, [open, current, pathname, router]);

  useEffect(() => {
    if (open) document.body.dataset.tour = "open";
    else delete document.body.dataset.tour;
    return () => {
      delete document.body.dataset.tour;
    };
  }, [open]);

  if (!enabled || !open || !current) return null;

  const last = step === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end lg:left-64 lg:items-end lg:justify-end lg:p-8">
      <div
        className="absolute inset-0 bg-[#171715]/45 lg:rounded-none"
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        className="relative z-10 mx-auto w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-2xl border border-neutral-200 bg-white p-4 shadow-2xl lg:mx-0 lg:mb-0 lg:max-w-md lg:rounded-2xl lg:p-6"
        style={{
          maxHeight: "min(32rem, 78dvh)",
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-[10px] font-bold tracking-[.18em] text-[#9b7a44]">
            {current.eyebrow} · {step + 1}/{TOUR_STEPS.length}
          </p>
          <button
            type="button"
            className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Fechar"
            onClick={() => void finish(true)}
          >
            <X className="size-4" />
          </button>
        </div>
        <h2
          id="tour-title"
          className="mt-2 font-display text-[clamp(1.4rem,6vw,1.85rem)] leading-[1.05]"
        >
          {current.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          {current.body}
        </p>
        <p className="mt-3 rounded-lg bg-[#f7f6f2] px-3 py-2 text-xs leading-relaxed text-neutral-500">
          {desktop ? current.hintDesktop : current.hintMobile}
        </p>
        <div className="mt-4 flex justify-center gap-1.5">
          {TOUR_STEPS.map((item, index) => (
            <span
              key={item.id}
              className={
                index === step
                  ? "h-1.5 w-6 rounded-full bg-[#c4a574]"
                  : "h-1.5 w-1.5 rounded-full bg-neutral-200"
              }
            />
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              if (last) void finish(false);
              else setStep((n) => n + 1);
            }}
          >
            {last ? "PRONTO, VAMOS USAR" : "PRÓXIMO"}
          </Button>
          {step > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setStep((n) => n - 1)}
            >
              VOLTAR
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => void finish(true)}
            >
              PULAR
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
