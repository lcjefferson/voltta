"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { useFeedback } from "@/providers/feedback-provider";

type Profile = {
  emailVerified?: boolean;
  email?: string;
};

export function EmailVerificationBanner() {
  const patchUser = useAuthStore((s) => s.patchUser);
  const localUser = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const { alert } = useFeedback();

  const { data: profile } = useQuery({
    queryKey: ["auth-me"],
    queryFn: () => api<Profile>("/auth/me"),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (typeof profile?.emailVerified === "boolean") {
      patchUser({ emailVerified: profile.emailVerified });
    }
  }, [profile?.emailVerified, patchUser]);

  const verified =
    profile?.emailVerified ?? localUser?.emailVerified ?? true;

  const resend = useMutation({
    mutationFn: () =>
      api<{ message: string }>("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    onSuccess: async (data) => {
      await alert({
        title: "E-mail enviado",
        message: data.message || "Enviamos um novo link de confirmação.",
      });
      qc.invalidateQueries({ queryKey: ["auth-me"] });
    },
    onError: async (error) => {
      await alert({
        title: "Não foi possível enviar",
        message: error instanceof Error ? error.message : "Tente novamente.",
      });
    },
  });

  if (verified) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 lg:ml-64">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 break-words">
          Confirme seu e-mail
          {profile?.email || localUser?.email
            ? ` (${profile?.email || localUser?.email})`
            : ""}{" "}
          para receber avisos e recuperação de senha.
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full shrink-0 border-amber-300 bg-white hover:bg-amber-100 sm:w-auto"
          disabled={resend.isPending}
          onClick={() => resend.mutate()}
        >
          {resend.isPending ? "ENVIANDO..." : "REENVIAR E-MAIL"}
        </Button>
      </div>
    </div>
  );
}
