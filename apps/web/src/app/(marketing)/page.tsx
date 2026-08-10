import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, MessageCircle, CalendarDays, RotateCcw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: CalendarDays, title: "Agenda 24h", text: "Link público. Cliente agenda sozinho — até de madrugada." },
  { icon: MessageCircle, title: "WhatsApp no piloto", text: "Confirmações, lembretes e retornos sem você digitar." },
  { icon: RotateCcw, title: "Clientes de volta", text: "Quem sumiu recebe o empurrão certo na hora certa." },
  { icon: TrendingUp, title: "Mais faturamento", text: "Menos cadeira vazia. Mais recorrência. Mais previsível." },
];

const pillars = [
  { n: "01", title: "CAPTURAR", text: "WhatsApp vira lead automático." },
  { n: "02", title: "ORGANIZAR", text: "Agenda e equipe sob controle." },
  { n: "03", title: "AUTOMATIZAR", text: "Mensagens que trabalham por você." },
  { n: "04", title: "RECUPERAR", text: "Quem esqueceu, volta a agendar." },
];

const planItems = [
  "Agenda online + link público",
  "Até 2 profissionais",
  "WhatsApp automatizado",
  "CRM + captação de leads",
  "Score VOLTTA™ de risco",
  "Dashboard e financeiro",
  "7 dias grátis · sem fidelidade",
];

const testimonials = [
  {
    name: "Rafael Moura",
    role: "Dono · Barbearia Norte Fade",
    city: "Curitiba, PR",
    quote:
      "Em 2 meses recuperei clientes que eu achava perdidos. A agenda ficou previsível — e eu parei de viver no WhatsApp.",
    image: "/marketing/testimonial-rafael.jpg",
    result: "+38% de retorno",
  },
  {
    name: "Camila Rocha",
    role: "Sócia · Studio Corte & Cia",
    city: "Belo Horizonte, MG",
    quote:
      "O link de agendamento sozinho já pagou a VOLTTA. Agora o WhatsApp confirma e lembra o cliente sem a gente precisar.",
    image: "/marketing/testimonial-camila.jpg",
    result: "Agenda 90% ocupada",
  },
  {
    name: "Diego Santos",
    role: "Barbeiro · Casa do Corte",
    city: "Campinas, SP",
    quote:
      "O Score mostra quem está esfriando. A gente manda a mensagem e a pessoa volta. Simples assim.",
    image: "/marketing/testimonial-diego.jpg",
    result: "R$ 2.4k recuperados/mês",
  },
];

const faqs = [
  {
    q: "Preciso instalar algo?",
    a: "Não. A VOLTTA roda no navegador, no celular ou no computador.",
  },
  {
    q: "O cliente agenda sozinho?",
    a: "Sim. Cada barbearia ganha um link público exclusivo de agendamento.",
  },
  {
    q: "As mensagens são automáticas?",
    a: "Sim. Depois de conectar o WhatsApp, confirmações, lembretes e retornos saem sozinhos.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Sem fidelidade, sem multa. Cancele em um clique.",
  },
];

export default function LandingPage() {
  return (
    <main className="bg-[#171715] text-white">
      {/* HERO — full-bleed image + brand */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <Image
          src="/marketing/hero-barbershop.jpg"
          alt="Interior de barbearia premium"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(12,11,10,.92)_0%,rgba(12,11,10,.72)_48%,rgba(12,11,10,.45)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(196,165,116,.22),transparent_45%)]" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col px-6 py-6 md:px-12">
          <nav className="flex items-center justify-between animate-reveal">
            <span className="font-display text-3xl tracking-[.2em]">
              VOLTTA<sup className="text-sm">™</sup>
            </span>
            <div className="flex items-center gap-5">
              <a
                href="#plano"
                className="hidden text-sm font-bold tracking-wide text-white/70 transition hover:text-white sm:inline"
              >
                PLANO
              </a>
              <Link
                href="/login"
                className="text-sm font-bold tracking-wide text-white/70 transition hover:text-white"
              >
                ENTRAR
              </Link>
            </div>
          </nav>

          <div className="flex flex-1 flex-col justify-center pb-16 pt-10">
            <p
              className="animate-reveal font-display text-5xl tracking-[.16em] text-[#c4a574] md:text-6xl"
              style={{ animationDelay: "40ms" }}
            >
              VOLTTA<sup className="text-lg">™</sup>
            </p>
            <h1
              className="animate-reveal mt-5 max-w-4xl font-display text-5xl leading-[.92] tracking-tight md:text-7xl lg:text-[5.5rem]"
              style={{ animationDelay: "120ms" }}
            >
              PARE DE PERDER
              <br />
              CLIENTES{" "}
              <span className="text-[#c4a574]">SEM PERCEBER.</span>
            </h1>
            <p
              className="animate-reveal mt-7 max-w-xl text-lg leading-relaxed text-white/75 md:text-xl"
              style={{ animationDelay: "200ms" }}
            >
              Agenda, WhatsApp e recuperação automática — para sua barbearia
              faturar com quem já te conhece.
            </p>
            <div
              className="animate-reveal mt-9 flex flex-wrap items-center gap-4"
              style={{ animationDelay: "280ms" }}
            >
              <Link href="/signup">
                <Button className="h-12 px-7 text-base">
                  COMEÇAR TESTE GRÁTIS
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <span className="text-sm text-white/55">
                7 dias grátis · sem cartão obrigatório
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Proof strip */}
      <section className="border-y border-white/10 bg-[#1c1b18] px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 text-sm text-white/65">
          <p>
            <strong className="text-[#c4a574]">+120</strong> barbearias no
            teste
          </p>
          <p>
            <strong className="text-[#c4a574]">R$ 79,90</strong>/mês · se paga
            com 2 retornos
          </p>
          <p>
            <strong className="text-[#c4a574]">7 dias</strong> para sentir o
            efeito
          </p>
        </div>
      </section>

      {/* Problem → promise */}
      <section className="bg-[#f7f6f2] px-6 py-20 text-[#171715] md:px-12 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold tracking-[.22em] text-[#9b7a44]">
              O VERDADEIRO PROBLEMA
            </p>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-5xl">
              VOCÊ NÃO PRECISA DE MAIS CLIENTES NOVOS.
              <br />
              <span className="text-[#9b7a44]">PRECISA DOS QUE JÁ TEM.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-neutral-600">
              Eles gostam do corte. Do ambiente. Do atendimento. Mas esquecem de
              marcar de novo — e a cadeira fica vazia.
            </p>
            <p className="mt-4 text-lg font-semibold text-[#171715]">
              A VOLTTA faz eles lembrarem. Automaticamente.
            </p>
            <Link href="/signup" className="mt-8 inline-block">
              <Button>
                QUERO RECUPERAR CLIENTES
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden md:aspect-[4/3]">
            <Image
              src="/marketing/feature-barber.jpg"
              alt="Barbeiro atendendo cliente"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#171715]/90 to-transparent p-6 text-white">
              <p className="font-display text-3xl text-[#c4a574]">R$ 1.000</p>
              <p className="mt-1 text-sm text-white/80">
                perdidos/mês se só 20 clientes de R$ 50 não voltarem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold tracking-[.22em] text-[#c4a574]">
            O QUE MUDA NA SUA OPERAÇÃO
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl leading-none md:text-5xl">
            MENOS WHATSAPP MANUAL.
            <br />
            MAIS CADEIRA OCUPADA.
          </h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div key={title} className="border-t-2 border-[#c4a574] pt-5">
                <Icon className="size-6 text-[#c4a574]" />
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature: booking + whatsapp */}
      <section className="bg-[#211f1b] px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="relative order-2 aspect-[4/3] overflow-hidden lg:order-1">
            <Image
              src="/marketing/feature-whatsapp.jpg"
              alt="Barbearia usando WhatsApp para agendamentos"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-xs font-bold tracking-[.22em] text-[#c4a574]">
              WHATSAPP + AGENDA
            </p>
            <h2 className="mt-4 font-display text-4xl leading-none md:text-5xl">
              SEU CLIENTE AGENDA.
              <br />
              A VOLTTA LEMBRA.
            </h2>
            <ul className="mt-8 space-y-4 text-sm text-white/75">
              {[
                "Link público 24h — sem ficar respondendo “tem horário?”",
                "Confirmação e lembrete automáticos no WhatsApp",
                "Campanha de retorno quando o cliente atrasa",
                "Leads do WhatsApp entram no CRM sozinhos",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#c4a574]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-[#f7f6f2] px-6 py-20 text-[#171715] md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold tracking-[.22em] text-[#9b7a44]">
            MÁQUINA DE RECORRÊNCIA
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl leading-none md:text-5xl">
            NÃO É SÓ AGENDA.
            <br />
            É CRESCIMENTO.
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <div key={p.title} className="border-t-2 border-[#c4a574] pt-5">
                <span className="font-display text-3xl text-[#c4a574]/45">
                  {p.n}
                </span>
                <h3 className="mt-2 font-display text-2xl tracking-wide">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold tracking-[.22em] text-[#c4a574]">
            QUEM JÁ USA
          </p>
          <h2 className="mt-4 font-display text-4xl leading-none md:text-5xl">
            RESULTADOS REAIS.
            <br />
            NA CADEIRA E NO CAIXA.
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col border-t border-white/15 pt-6"
              >
                <div className="flex items-center gap-4">
                  <div className="relative size-14 overflow-hidden rounded-full">
                    <Image
                      src={t.image}
                      alt={t.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <figcaption className="font-bold">{t.name}</figcaption>
                    <p className="text-xs text-white/50">
                      {t.role}
                      <br />
                      {t.city}
                    </p>
                  </div>
                </div>
                <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-white/75">
                  “{t.quote}”
                </blockquote>
                <p className="mt-5 text-sm font-bold text-[#c4a574]">
                  {t.result}
                </p>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ROI + Plan */}
      <section
        id="plano"
        className="bg-[#f7f6f2] px-6 py-20 text-[#171715] md:px-12 md:py-28"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <p className="text-xs font-bold tracking-[.22em] text-[#9b7a44]">
              PLANO ÚNICO
            </p>
            <h2 className="mt-4 font-display text-4xl leading-none md:text-5xl">
              R$ 79,90/MÊS.
              <br />
              SE PAGA SOZINHO.
            </h2>
            <p className="mt-6 max-w-md text-neutral-600">
              Recupere só 2 clientes de R$ 50 e a VOLTTA já se pagou. O resto é
              lucro — e cadeira ocupada.
            </p>
            <ul className="mt-8 space-y-3">
              {planItems.map((item) => (
                <li key={item} className="flex gap-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#a58450]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-2 border-[#c4a574] bg-white p-8 md:p-10">
            <p className="text-xs font-bold tracking-[.2em] text-[#9b7a44]">
              VOLTTA™
            </p>
            <p className="mt-3 font-display text-6xl">
              R$79<span className="text-2xl">,90</span>
            </p>
            <p className="text-sm text-neutral-500">por mês · cancele quando quiser</p>
            <Link href="/signup" className="mt-8 block">
              <Button className="h-12 w-full text-base">
                COMEÇAR TESTE GRÁTIS
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <p className="mt-4 text-center text-xs text-neutral-500">
              7 dias grátis · sem fidelidade
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-4xl md:text-5xl">DÚVIDAS RÁPIDAS</h2>
          <div className="mt-10">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group border-b border-white/15 py-5"
              >
                <summary className="cursor-pointer list-none font-bold tracking-wide [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span className="text-[#c4a574] transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden px-6 py-24 md:px-12 md:py-32">
        <Image
          src="/marketing/hero-barbershop.jpg"
          alt=""
          fill
          className="object-cover opacity-40"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#c4a574]/90" />
        <div className="relative mx-auto max-w-4xl text-center text-[#171715]">
          <h2 className="font-display text-4xl leading-[1.05] md:text-6xl">
            QUANTOS CLIENTES VOCÊ PERDEU ESTE MÊS?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[#171715]/80">
            Se não souber responder, está deixando dinheiro na mesa. Comece o
            teste e veja a diferença na agenda.
          </p>
          <p className="mt-10 font-display text-4xl tracking-[.16em] md:text-5xl">
            VOLTTA<sup className="text-base">™</sup>
          </p>
          <p className="mt-2 text-lg">Seu cliente sempre de volta.</p>
          <Link href="/signup">
            <Button className="mt-8 h-12 bg-[#171715] px-8 text-base text-white hover:bg-[#2c2c28]">
              COMEÇAR TESTE GRÁTIS AGORA
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/40">
        © {new Date().getFullYear()} VOLTTA™ — Seu cliente sempre de volta.
      </footer>
    </main>
  );
}
