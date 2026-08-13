"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFeedback } from "@/providers/feedback-provider";

const schema = z
  .object({
    password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
    confirm: z.string().min(6, "Confirme a senha"),
  })
  .refine((v) => v.password === v.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });
type Values = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [done, setDone] = useState(false);
  const { alert } = useFeedback();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  async function submit(values: Values) {
    if (!token) {
      await alert({
        title: "Link inválido",
        message: "Solicite uma nova redefinição de senha.",
      });
      return;
    }
    try {
      await api<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password: values.password }),
      });
      setDone(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch (error) {
      await alert({
        title: "Não foi possível salvar",
        message: error instanceof Error ? error.message : "Tente novamente.",
      });
    }
  }

  if (!token) {
    return (
      <div className="mt-8 space-y-4">
        <p className="text-sm text-red-600">
          Link inválido ou incompleto. Solicite uma nova redefinição.
        </p>
        <Link
          href="/forgot-password"
          className="block text-center text-sm font-bold text-[#9b7a44]"
        >
          Pedir novo link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mt-8 space-y-4">
        <p className="text-sm text-neutral-600">
          Senha alterada com sucesso. Redirecionando para o login...
        </p>
        <Link
          href="/login"
          className="block text-center text-sm font-bold text-[#9b7a44]"
        >
          Entrar agora
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-4">
      <div>
        <Label>Nova senha</Label>
        <Input
          type="password"
          {...register("password")}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>
      <div>
        <Label>Confirmar senha</Label>
        <Input
          type="password"
          {...register("confirm")}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        {errors.confirm && (
          <p className="mt-1 text-xs text-red-600">{errors.confirm.message}</p>
        )}
      </div>
      <Button disabled={isSubmitting} className="w-full">
        {isSubmitting ? "SALVANDO..." : "SALVAR NOVA SENHA"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f6f2] p-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-3xl tracking-widest">
          VOLTTA™
        </Link>
        <p className="mt-12 text-xs font-bold tracking-[.2em] text-[#9b7a44]">
          NOVA SENHA
        </p>
        <h1 className="mt-2 font-display text-5xl">REDEFINIR.</h1>
        <p className="mt-3 text-sm text-neutral-600">
          Escolha uma senha com pelo menos 6 caracteres.
        </p>
        <Suspense
          fallback={
            <p className="mt-8 text-sm text-neutral-500">Carregando...</p>
          }
        >
          <ResetPasswordForm />
        </Suspense>
        <Link
          href="/login"
          className="mt-6 block text-center text-sm font-bold text-[#9b7a44]"
        >
          Voltar para entrar
        </Link>
      </div>
    </main>
  );
}
