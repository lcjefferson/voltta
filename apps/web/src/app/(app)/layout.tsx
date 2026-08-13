"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Repeat2,
  Scissors,
  Settings,
  UserRound,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { EmailVerificationBanner } from "@/components/email-verification-banner";
import { Tooltip } from "@/components/ui/tooltip";

const nav = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Agenda", "/agenda", CalendarDays],
  ["Leads", "/leads", UserPlus],
  ["Clientes", "/clientes", Users],
  ["Profissionais", "/profissionais", UserRound],
  ["Serviços", "/servicos", Scissors],
  ["Financeiro", "/financeiro", CircleDollarSign],
  ["Automações", "/automacoes", Repeat2],
  ["WhatsApp", "/whatsapp", MessageCircle],
  ["Assinatura", "/assinatura", CreditCard],
  ["Configurações", "/configuracoes", Settings],
] as const;

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="mt-10 space-y-1">
      {nav.map(([label, href, Icon]) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition",
            pathname === href
              ? "bg-[#c4a574] font-bold text-[#171715]"
              : "text-white/65 hover:bg-white/10 hover:text-white",
          )}
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { accessToken, user, hydrated, hydrate, clearAuth } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!accessToken) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, accessToken, pathname, router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (!hydrated || !accessToken) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f6f2] text-sm text-neutral-500">
        Validando sessão...
      </div>
    );
  }

  const initials = (user?.name || "VO")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#1d1d1b]">
      <aside className="fixed inset-y-0 z-30 hidden w-64 border-r border-neutral-800 bg-[#171715] p-6 text-white lg:block">
        <Link href="/dashboard" className="font-display text-3xl tracking-widest">
          VOLTTA<sup className="text-xs">™</sup>
        </Link>
        <p className="mt-2 text-xs text-white/45">Seu cliente sempre de volta.</p>
        <NavLinks pathname={pathname} />
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/50"
            onClick={closeMenu}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col border-r border-neutral-800 bg-[#171715] p-6 text-white shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="font-display text-3xl tracking-widest"
                >
                  VOLTTA<sup className="text-xs">™</sup>
                </Link>
                <p className="mt-2 text-xs text-white/45">
                  Seu cliente sempre de volta.
                </p>
              </div>
              <button
                type="button"
                className="rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Fechar menu"
                onClick={closeMenu}
              >
                <X className="size-5" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={closeMenu} />
          </aside>
        </div>
      ) : null}

      <EmailVerificationBanner />
      <header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-5 lg:ml-64">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md p-2 text-neutral-700 hover:bg-neutral-100 lg:hidden"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-5" />
          </button>
          <span className="font-display text-2xl tracking-widest lg:hidden">
            VOLTTA™
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-sm text-neutral-500 sm:block">
            {user?.companyName || "Barbearia VOLTTA"}
          </span>
          <div className="grid size-9 place-items-center rounded-full bg-[#c4a574] text-sm font-bold">
            {initials}
          </div>
          <Tooltip content="Sair">
            <button
              type="button"
              className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100"
              aria-label="Sair"
              onClick={() => {
                clearAuth();
                router.push("/login");
              }}
            >
              <LogOut className="size-4" />
            </button>
          </Tooltip>
        </div>
      </header>
      <main className="p-5 lg:ml-64 lg:p-8">{children}</main>
    </div>
  );
}
