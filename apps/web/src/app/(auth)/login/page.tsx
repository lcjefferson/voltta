import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return <main className="grid min-h-screen bg-[#f7f6f2] md:grid-cols-2"><aside className="hidden bg-[#171715] p-12 text-white md:block"><p className="font-display text-4xl tracking-widest">VOLTTA<sup className="text-sm">™</sup></p><div className="mt-48 max-w-sm"><p className="font-display text-6xl leading-none">SEU CLIENTE SEMPRE DE VOLTA.</p><p className="mt-6 text-white/60">A plataforma de retenção feita para barbearias.</p></div></aside><section className="flex items-center justify-center p-6"><div className="w-full max-w-sm"><Link href="/" className="font-display text-3xl tracking-widest md:hidden">VOLTTA™</Link><p className="mt-8 text-sm font-bold tracking-[.2em] text-[#9b7a44]">BEM-VINDO DE VOLTA</p><h1 className="mt-2 font-display text-5xl">ENTRAR</h1><p className="mt-3 text-sm text-neutral-600">Acesse sua barbearia.</p><div className="mt-8"><AuthForm mode="login" /></div><p className="mt-6 text-center text-sm text-neutral-600">Ainda não tem conta? <Link href="/signup" className="font-bold text-[#9b7a44]">Comece agora</Link></p></div></section></main>;
}
