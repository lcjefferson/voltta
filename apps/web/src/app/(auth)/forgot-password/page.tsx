"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm<{ email: string }>();
  return <main className="flex min-h-screen items-center justify-center bg-[#f7f6f2] p-6"><div className="w-full max-w-sm"><Link href="/" className="font-display text-3xl tracking-widest">VOLTTA™</Link><p className="mt-12 text-xs font-bold tracking-[.2em] text-[#9b7a44]">RECUPERAR ACESSO</p><h1 className="mt-2 font-display text-5xl">NOVA SENHA.</h1><p className="mt-3 text-sm text-neutral-600">Enviaremos as instruções para o seu e-mail.</p><form onSubmit={handleSubmit(() => alert("Se o e-mail estiver cadastrado, você receberá as instruções."))} className="mt-8"><Label>E-mail</Label><Input type="email" {...register("email", { required: true })} placeholder="voce@barbearia.com" /><Button className="mt-5 w-full">ENVIAR INSTRUÇÕES</Button></form><Link href="/login" className="mt-6 block text-center text-sm font-bold text-[#9b7a44]">Voltar para entrar</Link></div></main>;
}
