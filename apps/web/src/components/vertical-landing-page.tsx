import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_TAGLINE } from "@/lib/seo";
import {
  VERTICAL_LIST,
  verticalJsonLd,
  type VerticalLanding,
  type VerticalSlug,
} from "@/lib/vertical-landings";
import type { BlogNiche } from "@/lib/blog/types";
import { testimonialsForNiche } from "@/lib/testimonials";

const SLUG_TO_NICHE: Record<VerticalSlug, BlogNiche> = {
  "para-barbearias": "barbearias",
  "para-saloes": "saloes",
  "para-estetica": "estetica",
};

export function VerticalLandingPage({
  landing,
}: {
  landing: VerticalLanding;
}) {
  const others = VERTICAL_LIST.filter((v) => v.slug !== landing.slug);
  const jsonLd = verticalJsonLd(landing);
  const testimonials = testimonialsForNiche(SLUG_TO_NICHE[landing.slug]);

  return (
    <main className="overflow-x-hidden bg-[#171715] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section
        className="relative min-h-[85svh] overflow-hidden"
        aria-labelledby="vertical-h1"
      >
        <Image
          src={landing.heroImage}
          alt={landing.heroAlt}
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

        <div className="relative mx-auto flex min-h-[85svh] max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-6 md:px-12">
          <nav
            className="flex items-center justify-between"
            aria-label="Principal"
          >
            <Link
              href="/"
              className="font-display text-2xl tracking-[.12em] sm:text-3xl sm:tracking-[.2em]"
            >
              VOLTTA<sup className="text-sm">™</sup>
            </Link>
            <div className="flex items-center gap-4 sm:gap-5">
              <Link
                href="/login"
                className="text-sm font-bold tracking-wide text-white/70 transition hover:text-white"
              >
                ENTRAR
              </Link>
              <Link href="/signup" className="hidden sm:inline">
                <Button className="h-10 px-4 text-sm">TESTE GRÁTIS</Button>
              </Link>
            </div>
          </nav>

          <div className="flex flex-1 flex-col justify-center pb-10 pt-8 sm:pb-16 sm:pt-10">
            <p className="text-xs font-bold tracking-[.22em] text-[#c4a574]">
              VOLTTA™ · {landing.navLabel.toUpperCase()}
            </p>
            <h1
              id="vertical-h1"
              className="mt-4 max-w-4xl font-display text-[1.75rem] leading-[1.1] tracking-tight sm:mt-5 sm:text-4xl md:text-6xl lg:text-[4rem] lg:leading-[1.05]"
            >
              {landing.h1}{" "}
              <span className="text-[#c4a574]">{landing.h1Accent}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              {landing.support}
            </p>
            <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="h-12 w-full px-7 text-base sm:w-auto">
                  COMEÇAR TESTE GRÁTIS
                  <ArrowRight className="ml-2 size-4" aria-hidden />
                </Button>
              </Link>
              <span className="text-center text-sm text-white/55 sm:text-left">
                7 dias · R$ 79,90/mês · sem fidelidade
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f6f2] px-4 py-16 text-[#171715] sm:px-6 sm:py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-xs font-bold tracking-[.22em] text-[#9b7a44]">
              {landing.problemEyebrow}
            </p>
            <h2 className="mt-4 font-display text-3xl leading-[1.1] sm:text-4xl md:text-5xl">
              {landing.problemTitle}
              <br />
              <span className="text-[#9b7a44]">{landing.problemTitleAccent}</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-neutral-600 sm:text-lg">
              {landing.problemBody}
            </p>
            <p className="mt-4 text-base font-semibold sm:text-lg">
              {landing.problemClose}
            </p>
          </div>
          <ul className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
            {landing.painPoints.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-neutral-700">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-[#9b7a44]"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold tracking-[.22em] text-[#c4a574]">
            O QUE A VOLTTA RESOLVE
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl leading-[1.05] sm:text-4xl md:text-5xl">
            FEITO PARA {landing.navLabel.toUpperCase()}.
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {landing.benefits.map((b) => (
              <div key={b.title} className="border-t-2 border-[#c4a574] pt-5">
                <h3 className="text-lg font-bold">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {b.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#211f1b] px-4 py-16 sm:px-6 sm:py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold tracking-[.22em] text-[#c4a574]">
            COMO FUNCIONA
          </p>
          <h2 className="mt-4 font-display text-3xl leading-[1.05] sm:text-4xl">
            SIMPLES DE USAR.
            <br />
            FORTE NA RECORRÊNCIA.
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {landing.howItWorks.map((step, i) => (
              <div key={step.title} className="border-t border-white/15 pt-6">
                <span className="font-display text-3xl text-[#c4a574]/50">
                  0{i + 1}
                </span>
                <h3 className="mt-3 font-display text-2xl tracking-wide">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-white/65">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="px-4 py-16 sm:px-6 sm:py-20 md:px-12"
        aria-labelledby="vertical-testimonials-heading"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold tracking-[.22em] text-[#c4a574]">
            QUEM JÁ USA
          </p>
          <h2
            id="vertical-testimonials-heading"
            className="mt-4 font-display text-3xl leading-[1.05] sm:text-4xl"
          >
            RESULTADO EM {landing.navLabel.toUpperCase()}.
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={`${t.name}-${t.niche}`}
                className="flex flex-col border-t border-white/15 pt-6"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={t.image}
                    alt={`${t.name}, ${t.role} em ${t.city} — depoimento Voltta`}
                    width={1024}
                    height={1024}
                    loading="lazy"
                    decoding="async"
                    quality={75}
                    className="size-14 rounded-full object-cover"
                    sizes="56px"
                  />
                  <div className="min-w-0">
                    <figcaption className="font-bold break-words">{t.name}</figcaption>
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

      <section className="bg-[#f7f6f2] px-4 py-16 text-[#171715] sm:px-6 sm:py-20 md:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold tracking-[.22em] text-[#9b7a44]">
            PERGUNTAS FREQUENTES
          </p>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl">
            DÚVIDAS DE {landing.navLabel.toUpperCase()}
          </h2>
          <div className="mt-10 space-y-3">
            {landing.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-lg border border-neutral-200 bg-white px-5 py-4"
              >
                <summary className="cursor-pointer list-none font-semibold marker:content-none">
                  <h3 className="inline text-base font-semibold">
                    {faq.question}
                  </h3>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 py-20 sm:px-6 md:px-12 md:py-28">
        <div className="absolute inset-0 bg-[#c4a574]" />
        <div className="relative mx-auto max-w-4xl text-center text-[#171715]">
          <h2 className="font-display text-3xl leading-[1.1] sm:text-4xl md:text-5xl">
            {landing.ctaTitle}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base text-[#171715]/80 sm:text-lg">
            {landing.ctaBody}
          </p>
          <p className="mt-8 font-display text-[clamp(1.75rem,8vw,3rem)] tracking-[.08em] sm:tracking-[.1em]">
            VOLTTA<sup className="text-base">™</sup>
          </p>
          <p className="mt-2">{SITE_TAGLINE}</p>
          <Link href="/signup" className="mt-8 inline-block w-full sm:w-auto">
            <Button className="h-12 w-full bg-[#171715] px-8 text-base text-white hover:bg-[#2c2c28] sm:w-auto">
              COMEÇAR TESTE GRÁTIS
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </Button>
          </Link>
        </div>
      </section>

      <section className="border-t border-white/10 px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/55">A VOLTTA também atende:</p>
          <div className="flex flex-wrap gap-3">
            {others.map((v) => (
              <Link
                key={v.slug}
                href={v.path}
                className="rounded-md border border-white/20 px-4 py-2 text-sm font-bold text-white/80 transition hover:border-[#c4a574] hover:text-[#c4a574]"
              >
                {v.navLabel}
              </Link>
            ))}
            <Link
              href="/"
              className="rounded-md border border-white/20 px-4 py-2 text-sm font-bold text-white/80 transition hover:border-[#c4a574] hover:text-[#c4a574]"
            >
              Visão geral
            </Link>
            <Link
              href="/blog"
              className="rounded-md border border-white/20 px-4 py-2 text-sm font-bold text-white/80 transition hover:border-[#c4a574] hover:text-[#c4a574]"
            >
              Blog
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-xs text-white/40 sm:px-6">
        <p>
          © {new Date().getFullYear()} VOLTTA™ — Sistema de agendamento para{" "}
          {landing.audience}. {SITE_TAGLINE}
        </p>
        <p className="mt-3">
          Desenvolvido por{" "}
          <a
            href="https://fortallabs.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 underline-offset-2 hover:underline"
          >
            FortalLabs
          </a>
        </p>
      </footer>
    </main>
  );
}
