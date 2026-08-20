import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-x-clip bg-[#171715] p-4 sm:p-6">
      <div className="w-full min-w-0 max-w-md rounded-xl bg-[#f7f6f2] p-5 sm:p-7 md:p-10">
        <Link href="/" className="font-display text-2xl tracking-[.12em] sm:text-3xl sm:tracking-widest">
          VOLTTA<sup className="text-xs">™</sup>
        </Link>
        <p className="mt-8 text-xs font-bold tracking-[.2em] text-[#9b7a44]">
          TESTE GRÁTIS
        </p>
        <h1 className="mt-2 font-display text-[clamp(1.75rem,8vw,3rem)] leading-none">
          VAMOS CRESCER.
        </h1>
        <p className="mt-3 text-sm text-neutral-600">
          Para barbearias, salões e profissionais de estética. Crie sua conta e
          comece a trazer clientes de volta.
        </p>
        <div className="mt-7">
          <AuthForm mode="signup" />
        </div>
        <p className="mt-6 text-center text-sm text-neutral-600">
          Já usa a VOLTTA?{" "}
          <Link href="/login" className="font-bold text-[#9b7a44]">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
