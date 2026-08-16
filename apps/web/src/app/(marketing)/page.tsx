import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Check,
  MessageCircle,
  CalendarDays,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LANDING_FAQS,
  OG_IMAGE_ALT,
  OG_IMAGE_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_TITLE,
  SITE_URL,
  homePageJsonLd,
} from "@/lib/seo";
import { HOME_TESTIMONIALS } from "@/lib/testimonials";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_URL,
        alt: OG_IMAGE_ALT,
        width: 1200,
        height: 630,
      },
    ],
  },
};

const benefits = [
  {
    icon: CalendarDays,
    title: "Agenda online 24h",
    text: "Link público de agendamento. Cliente marca sozinho — até de madrugada.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp automático",
    text: "Confirmações, lembretes e retornos no WhatsApp sem você digitar.",
  },
  {
    icon: RotateCcw,
    title: "Clientes de volta",
    text: "Recuperação automática de quem sumiu — na hora certa.",
  },
  {
    icon: TrendingUp,
    title: "Mais faturamento",
    text: "Menos cadeira vazia. Mais recorrência. Agenda previsível.",
  },
];

const pillars = [
  { n: "01", title: "CAPTURAR", text: "WhatsApp vira lead automático no CRM." },
  { n: "02", title: "ORGANIZAR", text: "Agenda e equipe do seu negócio sob controle." },
  { n: "03", title: "AUTOMATIZAR", text: "Mensagens que trabalham por você." },
  { n: "04", title: "RECUPERAR", text: "Quem esqueceu, volta a agendar." },
];

const planItems = [
  "Agenda online + link público de agendamento",
  "Até 5 profissionais",
  "WhatsApp automatizado para beleza",
  "CRM + captação de leads",
  "Score VOLTTA™ de risco",
  "Dashboard e financeiro",
  "7 dias grátis · sem fidelidade",
];

const audiences = [
  {
    title: "Barbearias",
    text: "Corte, barba e combo com retorno automático — sem viver no WhatsApp.",
    href: "/para-barbearias",
    image: "/marketing/hero-barbershop.webp",
  },
  {
    title: "Salões",
    text: "Equipe, agenda e clientes recorrentes em um só lugar.",
    href: "/para-saloes",
    image: "/marketing/hero-salon.webp",
  },
  {
    title: "Estética",
    text: "Manicure, cílios, sobrancelha e procedimentos com lembrete na hora certa.",
    href: "/para-estetica",
    image: "/marketing/hero-aesthetics.webp",
  },
];

const testimonials = HOME_TESTIMONIALS;
const faqs = LANDING_FAQS.map((f) => ({ q: f.question, a: f.answer }));
const homeJsonLd = homePageJsonLd();

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden bg-[#171715] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {/* HERO */}
      <section
        className="relative min-h-[100svh] overflow-hidden"
        aria-labelledby="landing-h1"
      >
        <Image
          src="/marketing/hero-beauty.webp"
          alt="Espaço de beleza com sistema de agendamento online Voltta para barbearias, salões e estética"
          width={1536}
          height={1024}
          priority
          fetchPriority="high"
          quality={82}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(12,11,10,.92)_0%,rgba(12,11,10,.72)_48%,rgba(12,11,10,.45)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(196,165,116,.22),transparent_45%)]" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-6 md:px-12">
          <nav
            className="flex items-center justify-between animate-reveal"
            aria-label="Principal"
          >
            <span className="font-display text-2xl tracking-[.12em] sm:text-3xl sm:tracking-[.2em]">
              VOLTTA<sup className="text-sm">™</sup>
            </span>
            <div className="flex items-center gap-4 sm:gap-5">
              <a
                href="#plano"
                className="hidden text-sm font-bold tracking-wide text-white/70 transition hover:text-white sm:inline"
              >
                PLANO
              </a>
              <Link
                href="/blog"
                className="hidden text-sm font-bold tracking-wide text-white/70 transition hover:text-white sm:inline"
              >
                BLOG
              </Link>
              <Link
                href="/login"
                className="text-sm font-bold tracking-wide text-white/70 transition hover:text-white"
              >
                ENTRAR
              </Link>
            </div>
          </nav>

          <div className="flex flex-1 flex-col justify-center pb-10 pt-8 sm:pb-16 sm:pt-10">
            <p
              className="animate-reveal font-display text-4xl tracking-[.1em] text-[#c4a574] sm:text-5xl sm:tracking-[.16em] md:text-6xl"
              style={{ animationDelay: "40ms" }}
            >
              VOLTTA<sup className="text-base sm:text-lg">™</sup>
            </p>
            <h1
              id="landing-h1"
              className="animate-reveal mt-4 max-w-4xl font-display text-[1.75rem] leading-[1.1] tracking-tight sm:mt-5 sm:text-4xl md:text-6xl lg:text-[4.25rem] lg:leading-[1.05]"
              style={{ animationDelay: "120ms" }}
            >
              Sistema de agendamento online e automação WhatsApp{" "}
              <span className="text-[#c4a574]">
                para barbearias, salões e estética
              </span>
            </h1>
            <p
              className="animate-reveal mt-4 max-w-2xl font-display text-xl leading-snug tracking-tight text-white/90 sm:mt-6 sm:text-2xl md:text-3xl"
              style={{ animationDelay: "160ms" }}
            >
              Pare de perder clientes{" "}
              <span className="text-[#c4a574]">sem perceber.</span>
            </p>
            <p
              className="animate-reveal mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:mt-5 sm:text-lg md:text-xl"
              style={{ animationDelay: "200ms" }}
            >
              Agenda online, WhatsApp automático e recuperação de clientes —{" "}
              {SITE_TAGLINE.toLowerCase()}
            </p>
            <div
              className="animate-reveal mt-7 flex w-full flex-col items-stretch gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
              style={{ animationDelay: "280ms" }}
            >
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="h-12 w-full px-7 text-base sm:w-auto">
                  COMEÇAR TESTE GRÁTIS
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <span className="text-center text-sm text-white/55 sm:text-left">
                7 dias grátis · sem cartão obrigatório
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-y border-white/10 bg-[#1c1b18] px-4 py-8 sm:px-6 md:px-12"
        aria-label="Números da Voltta"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-white/65 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6">
          <p>
            <strong className="text-[#c4a574]">+120</strong> negócios de beleza
            no teste
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

      <section className="bg-[#f7f6f2] px-4 py-16 text-[#171715] sm:px-6 sm:py-20 md:px-12 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-10 sm:gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold tracking-[.22em] text-[#9b7a44]">
              O VERDADEIRO PROBLEMA
            </p>
            <h2 className="mt-4 font-display text-3xl leading-[1.1] sm:text-4xl md:text-5xl md:leading-[1.05]">
              VOCÊ NÃO PRECISA DE MAIS CLIENTES NOVOS.
              <br />
              <span className="text-[#9b7a44]">PRECISA DOS QUE JÁ TEM.</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-neutral-600 sm:text-lg">
              Eles gostam do atendimento. Do resultado. Do ambiente. Mas
              esquecem de marcar de novo — e o horário fica vazio.
            </p>
            <p className="mt-4 text-base font-semibold text-[#171715] sm:text-lg">
              A VOLTTA faz eles lembrarem. Automaticamente.
            </p>
            <Link href="/signup" className="mt-8 block w-full sm:inline-block sm:w-auto">
              <Button className="h-12 w-full sm:w-auto">
                QUERO RECUPERAR CLIENTES
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden md:aspect-[4/3]">
            <Image
              src="/marketing/feature-salon.webp"
              alt="Profissional de salão atendendo cliente com agenda organizada pela Voltta"
              width={1536}
              height={1024}
              loading="lazy"
              decoding="async"
              quality={80}
              className="h-full w-full object-cover"
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

      <section className="px-4 py-16 sm:px-6 sm:py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold tracking-[.22em] text-[#c4a574]">
            O QUE MUDA NA SUA OPERAÇÃO
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl leading-[1.05] sm:text-4xl md:text-5xl md:leading-none">
            MENOS WHATSAPP MANUAL.
            <br />
            MAIS CADEIRA OCUPADA.
          </h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div key={title} className="border-t-2 border-[#c4a574] pt-5">
                <Icon
                  className="size-6 text-[#c4a574]"
                  aria-hidden
                  focusable="false"
                />
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#211f1b] px-4 py-16 sm:px-6 sm:py-20 md:px-12 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-10 sm:gap-12 lg:grid-cols-2">
          <div className="relative order-2 aspect-[4/3] overflow-hidden lg:order-1">
            <Image
              src="/marketing/feature-whatsapp.webp"
              alt="Automação de WhatsApp para confirmação e lembrete de horários"
              width={1536}
              height={1024}
              loading="lazy"
              decoding="async"
              quality={80}
              className="h-full w-full object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-xs font-bold tracking-[.22em] text-[#c4a574]">
              WHATSAPP + AGENDA ONLINE
            </p>
            <h2 className="mt-4 font-display text-3xl leading-[1.05] sm:text-4xl md:text-5xl md:leading-none">
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
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-[#c4a574]"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f6f2] px-4 py-16 text-[#171715] sm:px-6 sm:py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold tracking-[.22em] text-[#9b7a44]">
            MÁQUINA DE RECORRÊNCIA
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl leading-[1.05] sm:text-4xl md:text-5xl md:leading-none">
            NÃO É SÓ AGENDA.
            <br />
            É CRESCIMENTO PARA O SEU NEGÓCIO.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {audiences.map((a) => (
              <Link
                key={a.title}
                href={a.href}
                className="group overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:border-[#c4a574]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={a.image}
                    alt={
                      a.title === "Barbearias"
                        ? "Barbearia com agenda online e WhatsApp automático Voltta"
                        : a.title === "Salões"
                          ? "Salão de beleza com link de agendamento online Voltta"
                          : "Estúdio de estética com lembretes de horário no WhatsApp Voltta"
                    }
                    width={960}
                    height={600}
                    loading="lazy"
                    decoding="async"
                    quality={75}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl tracking-wide text-[#9b7a44]">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600">{a.text}</p>
                  <p className="mt-3 text-xs font-bold tracking-wide text-[#9b7a44]">
                    VER PÁGINA →
                  </p>
                </div>
              </Link>
            ))}
          </div>
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

      <section className="px-4 py-16 sm:px-6 sm:py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold tracking-[.22em] text-[#c4a574]">
            QUEM JÁ USA
          </p>
          <h2 className="mt-4 font-display text-3xl leading-[1.05] sm:text-4xl md:text-5xl md:leading-none">
            RESULTADOS REAIS NA BELEZA.
            <br />
            NA AGENDA E NO CAIXA.
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col border-t border-white/15 pt-6"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={t.image}
                    alt={`${t.name}, ${t.role} — cliente Voltta`}
                    width={1024}
                    height={1024}
                    loading="lazy"
                    decoding="async"
                    quality={75}
                    className="size-14 rounded-full object-cover"
                    sizes="56px"
                  />
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

      <section
        id="plano"
        className="bg-[#f7f6f2] px-4 py-16 text-[#171715] sm:px-6 sm:py-20 md:px-12 md:py-28"
        aria-labelledby="plano-heading"
      >
        <div className="mx-auto grid max-w-6xl gap-10 sm:gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <p className="text-xs font-bold tracking-[.22em] text-[#9b7a44]">
              PLANO ÚNICO
            </p>
            <h2
              id="plano-heading"
              className="mt-4 font-display text-3xl leading-[1.05] sm:text-4xl md:text-5xl md:leading-none"
            >
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
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-[#a58450]"
                    aria-hidden
                  />
                  <span className="min-w-0 break-words">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-2 border-[#c4a574] bg-white p-6 sm:p-8 md:p-10">
            <p className="text-xs font-bold tracking-[.2em] text-[#9b7a44]">
              VOLTTA™
            </p>
            <p className="mt-3 font-display text-5xl sm:text-6xl">
              R$79<span className="text-2xl">,90</span>
            </p>
            <p className="text-sm text-neutral-500">
              por mês · cancele quando quiser
            </p>
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

      <section
        className="px-4 py-16 sm:px-6 sm:py-20 md:px-12 md:py-24"
        aria-labelledby="faq-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="faq-heading"
            className="font-display text-3xl leading-[1.1] sm:text-4xl md:text-5xl"
          >
            DÚVIDAS SOBRE O SISTEMA PARA BARBEARIA
          </h2>
          <div className="mt-10">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group border-b border-white/15 py-5"
              >
                <summary className="cursor-pointer list-none font-bold tracking-wide [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-4">
                    <h3 className="min-w-0 text-left text-sm font-bold sm:text-base">
                      {item.q}
                    </h3>
                    <span
                      className="shrink-0 text-[#c4a574] transition group-open:rotate-45"
                      aria-hidden
                    >
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

      <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 md:px-12 md:py-32">
        <Image
          src="/marketing/hero-beauty.webp"
          alt="Ambiente de beleza com agenda online Voltta — fundo da chamada final"
          width={1536}
          height={1024}
          loading="lazy"
          decoding="async"
          quality={70}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#c4a574]/90" />
        <div className="relative mx-auto max-w-4xl text-center text-[#171715]">
          <h2 className="font-display text-3xl leading-[1.1] sm:text-4xl md:text-6xl md:leading-[1.05]">
            QUANTOS CLIENTES VOCÊ PERDEU ESTE MÊS?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base text-[#171715]/80 sm:text-lg">
            Se não souber responder, está deixando dinheiro na mesa. Comece o
            teste e veja a diferença na agenda do seu negócio.
          </p>
          <p className="mt-10 font-display text-3xl tracking-[.1em] sm:text-4xl sm:tracking-[.16em] md:text-5xl">
            VOLTTA<sup className="text-base">™</sup>
          </p>
          <p className="mt-2 text-base sm:text-lg">{SITE_TAGLINE}</p>
          <Link href="/signup" className="mt-8 inline-block w-full sm:w-auto">
            <Button className="h-12 w-full bg-[#171715] px-8 text-base text-white hover:bg-[#2c2c28] sm:w-auto">
              COMEÇAR TESTE GRÁTIS AGORA
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-xs text-white/40 sm:px-6">
        <p className="mx-auto max-w-lg leading-relaxed">
          © {new Date().getFullYear()} VOLTTA™ — Sistema de agendamento online
          para barbearias, salões e estética. {SITE_TAGLINE}{" "}
          <Link href="/blog" className="text-white/60 underline-offset-2 hover:underline">
            Blog
          </Link>
        </p>
      </footer>
    </main>
  );
}
