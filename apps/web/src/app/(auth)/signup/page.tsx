import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[#171715] p-6"><div className="w-full max-w-md rounded-xl bg-[#f7f6f2] p-7 md:p-10"><Link href="/" className="font-display text-3xl tracking-widest">VOLTTA<sup className="text-xs">™</sup></Link><p className="mt-8 text-xs font-bold tracking-[.2em] text-[#9b7a44]">TESTE GRÁTIS</p><h1 className="mt-2 font-display text-5xl">VAMOS CRESCER.</h1><p className="mt-3 text-sm text-neutral-600">Crie sua conta e comece a trazer seus clientes de volta.</p><div className="mt-7"><AuthForm mode="signup" /></div><p className="mt-6 text-center text-sm text-neutral-600">Já usa a VOLTTA? <Link href="/login" className="font-bold text-[#9b7a44]">Entrar</Link></p></div></main>;
}
