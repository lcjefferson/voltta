"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFeedback } from "@/providers/feedback-provider";

const schema = z.object({
  email: z.string().email("Informe um e-mail válido"),
});
type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const { alert } = useFeedback();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function submit(values: Values) {
    try {
      await api<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: values.email }),
      });
      setDone(true);
    } catch (error) {
      await alert({
        title: "Não foi possível enviar",
        message: error instanceof Error ? error.message : "Tente novamente.",
      });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-x-clip bg-[#f7f6f2] p-4 sm:p-6">
      <div className="w-full min-w-0 max-w-sm">
        <Link href="/" className="font-display text-2xl tracking-[.12em] sm:text-3xl sm:tracking-widest">
          VOLTTA™
        </Link>
        <p className="mt-12 text-xs font-bold tracking-[.2em] text-[#9b7a44]">
          RECUPERAR ACESSO
        </p>
        <h1 className="mt-2 font-display text-[clamp(1.75rem,8vw,3rem)] leading-none">
          NOVA SENHA.
        </h1>
        {done ? (
          <div className="mt-8 space-y-4">
            <p className="text-sm text-neutral-600">
              Se o e-mail estiver cadastrado, você receberá as instruções em
              instantes. Verifique também a caixa de spam.
            </p>
            <Link
              href="/login"
              className="block text-center text-sm font-bold text-[#9b7a44]"
            >
              Voltar para entrar
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm text-neutral-600">
              Enviaremos as instruções para o seu e-mail.
            </p>
            <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-4">
              <div>
                <Label>E-mail</Label>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="voce@email.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <Button disabled={isSubmitting} className="w-full">
                {isSubmitting ? "ENVIANDO..." : "ENVIAR INSTRUÇÕES"}
              </Button>
            </form>
            <Link
              href="/login"
              className="mt-6 block text-center text-sm font-bold text-[#9b7a44]"
            >
              Voltar para entrar
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
