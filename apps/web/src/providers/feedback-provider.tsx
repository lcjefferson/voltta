"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
};

type AlertOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
};

type FeedbackContextValue = {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  alert: (options: AlertOptions | string) => Promise<void>;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

type DialogState =
  | {
      kind: "confirm";
      options: ConfirmOptions;
      resolve: (value: boolean) => void;
    }
  | {
      kind: "alert";
      options: AlertOptions;
      resolve: () => void;
    }
  | null;

function normalizeConfirm(options: ConfirmOptions | string): ConfirmOptions {
  if (typeof options === "string") return { message: options };
  return options;
}

function normalizeAlert(options: AlertOptions | string): AlertOptions {
  if (typeof options === "string") return { message: options };
  return options;
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const openRef = useRef(false);

  const confirm = useCallback((options: ConfirmOptions | string) => {
    return new Promise<boolean>((resolve) => {
      openRef.current = true;
      setDialog({
        kind: "confirm",
        options: normalizeConfirm(options),
        resolve: (value) => {
          openRef.current = false;
          setDialog(null);
          resolve(value);
        },
      });
    });
  }, []);

  const alert = useCallback((options: AlertOptions | string) => {
    return new Promise<void>((resolve) => {
      openRef.current = true;
      setDialog({
        kind: "alert",
        options: normalizeAlert(options),
        resolve: () => {
          openRef.current = false;
          setDialog(null);
          resolve();
        },
      });
    });
  }, []);

  const value = useMemo(() => ({ confirm, alert }), [confirm, alert]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {dialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1d1d1b]/45 p-4"
          role="presentation"
          onClick={() => {
            if (dialog.kind === "confirm") dialog.resolve(false);
            else dialog.resolve();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="voltta-feedback-title"
            className="w-full max-w-md rounded-xl border border-neutral-200 bg-[#f7f6f2] p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              id="voltta-feedback-title"
              className="font-display text-2xl tracking-wide text-[#1d1d1b]"
            >
              {dialog.kind === "confirm"
                ? dialog.options.title || "Confirmar"
                : dialog.options.title || "Aviso"}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              {dialog.options.message}
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              {dialog.kind === "confirm" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => dialog.resolve(false)}
                >
                  {dialog.options.cancelLabel || "CANCELAR"}
                </Button>
              )}
              <Button
                type="button"
                className={cn(
                  dialog.kind === "confirm" &&
                    dialog.options.tone === "danger" &&
                    "bg-red-700 text-white hover:bg-red-800",
                )}
                onClick={() => {
                  if (dialog.kind === "confirm") dialog.resolve(true);
                  else dialog.resolve();
                }}
              >
                {dialog.kind === "confirm"
                  ? dialog.options.confirmLabel || "CONFIRMAR"
                  : dialog.options.confirmLabel || "OK"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error("useFeedback must be used within FeedbackProvider");
  }
  return ctx;
}
