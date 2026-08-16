import type { BlogNiche } from "@/lib/blog/types";

export type Testimonial = {
  name: string;
  role: string;
  city: string;
  quote: string;
  image: string;
  result: string;
  niche: BlogNiche;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Rafael Moura",
    role: "Dono · Barbearia Norte Fade",
    city: "Curitiba, PR",
    quote:
      "Em 2 meses recuperei clientes que eu achava perdidos. A agenda ficou previsível — e eu parei de viver no WhatsApp.",
    image: "/marketing/testimonial-rafael.webp",
    result: "+38% de retorno",
    niche: "barbearias",
  },
  {
    name: "Camila Rocha",
    role: "Sócia · Studio Beleza & Cia",
    city: "Belo Horizonte, MG",
    quote:
      "O link de agendamento sozinho já pagou a VOLTTA. Agora o WhatsApp confirma e lembra a cliente sem a gente precisar.",
    image: "/marketing/testimonial-camila.webp",
    result: "Agenda 90% ocupada",
    niche: "saloes",
  },
  {
    name: "Diego Santos",
    role: "Profissional · Casa do Corte",
    city: "Campinas, SP",
    quote:
      "O Score mostra quem está esfriando. A gente manda a mensagem e a pessoa volta. Simples assim.",
    image: "/marketing/testimonial-diego.webp",
    result: "R$ 2.4k recuperados/mês",
    niche: "barbearias",
  },
];

/** Depoimentos exibidos na home (todos). */
export const HOME_TESTIMONIALS = TESTIMONIALS;

/** Um ou mais depoimentos alinhados ao nicho da landing vertical. */
export function testimonialsForNiche(niche: BlogNiche): Testimonial[] {
  const matched = TESTIMONIALS.filter((t) => t.niche === niche);
  if (matched.length > 0) return matched;
  // Fallback: Camila (salão) para estética até haver case próprio
  if (niche === "estetica") {
    return [
      {
        ...TESTIMONIALS.find((t) => t.niche === "saloes")!,
        role: "Sócia · Studio Beleza & Cia",
        quote:
          "No estúdio, o lembrete no WhatsApp salvou as manutenções. A cliente agenda pelo link e a gente para de caçar horário no chat.",
        result: "Menos falta na agenda",
        niche: "estetica",
      },
    ];
  }
  return [TESTIMONIALS[0]];
}
