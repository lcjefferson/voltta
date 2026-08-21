"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import {
  BUSINESS_TYPES,
  type BusinessTypeValue,
} from "@/lib/business-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFeedback } from "@/providers/feedback-provider";

const formSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  companySlug: z.string().optional(),
  name: z.string().optional(),
  companyName: z.string().optional(),
  businessType: z.enum(["BARBERSHOP", "SALON", "AESTHETICS"]).optional(),
});
type AuthValues = z.infer<typeof formSchema>;

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { alert } = useFeedback();
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AuthValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      companyName: "",
      companySlug: "",
      businessType: "BARBERSHOP",
    },
  });

  const businessType = (watch("businessType") ||
    "BARBERSHOP") as BusinessTypeValue;
  const companyExample =
    BUSINESS_TYPES.find((t) => t.value === businessType)?.example ||
    "Ex.: Seu negócio";

  async function submit(values: AuthValues) {
    if (mode === "signup" && (!values.name || !values.companyName)) {
      if (!values.name) setError("name", { message: "Informe seu nome" });
      if (!values.companyName)
        setError("companyName", {
          message: "Informe o nome do seu negócio",
        });
      return;
    }
    try {
      const data = await api<{
        accessToken: string;
        refreshToken: string;
        user: {
          name: string;
          email: string;
          role?: string;
          companyName?: string;
          trialLocked?: boolean;
        };
      }>(mode === "signup" ? "/auth/signup" : "/auth/login", {
        method: "POST",
        body: JSON.stringify(
          mode === "signup"
            ? {
                name: values.name,
                email: values.email,
                password: values.password,
                companyName: values.companyName,
                businessType: values.businessType || "BARBERSHOP",
              }
            : {
                email: values.email,
                password: values.password,
              },
        ),
      });
      setAuth(data.accessToken, data.refreshToken, data.user);
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");
      router.push(
        data.user.trialLocked
          ? "/assinatura"
          : next || (mode === "signup" ? "/dashboard?tour=1" : "/dashboard"),
      );
    } catch (error) {
      await alert({
        title: "Não foi possível continuar",
        message:
          error instanceof Error ? error.message : "Tente novamente.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {mode === "signup" && (
        <>
          <div>
            <Label>Seu nome</Label>
            <Input {...register("name")} placeholder="Seu nome" />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label>Tipo do negócio</Label>
            <select
              className="flex h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
              {...register("businessType")}
            >
              {BUSINESS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Nome do negócio</Label>
            <Input
              {...register("companyName")}
              placeholder={companyExample}
            />
            {errors.companyName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.companyName.message}
              </p>
            )}
          </div>
        </>
      )}
      <div>
        <Label>E-mail</Label>
        <Input
          type="email"
          {...register("email")}
          placeholder="voce@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>
      <div>
        <Label>Senha</Label>
        <Input
          type="password"
          {...register("password")}
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>
      {mode === "login" && (
        <Link
          href="/forgot-password"
          className="block text-right text-xs font-bold text-[#9b7a44]"
        >
          Esqueci minha senha
        </Link>
      )}
      <Button disabled={isSubmitting} className="mt-2 w-full">
        {isSubmitting
          ? "AGUARDE..."
          : mode === "signup"
            ? "CRIAR MINHA CONTA"
            : "ENTRAR NA VOLTTA"}
      </Button>
    </form>
  );
}
