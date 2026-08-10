export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://volttaagenda.fortallabs.com.br";

export const SITE_NAME = "VOLTTA";

/** Title Tag — keyword principal no início + marca */
export const SITE_TITLE =
  "Voltta: Sistema de Agendamento Online e Automação para Barbearias";

/** Meta Description — ~155 chars, CTA + keywords do nicho */
export const SITE_DESCRIPTION =
  "Voltta é o sistema de agendamento online, automação WhatsApp e retenção para barbearias. Encha sua agenda e fidelize clientes — teste grátis 7 dias.";

/** H1 canônico da landing (visível, único) */
export const LANDING_H1 =
  "Sistema de agendamento online e automação WhatsApp para barbearias";

export const SITE_KEYWORDS = [
  "sistema para barbearia",
  "agenda para barbearia",
  "agenda online para barbeiro",
  "agendamento online barbearia",
  "software para barbearia",
  "CRM para barbearia",
  "WhatsApp para barbearia",
  "automação WhatsApp barbearia",
  "gestão para barbearia",
  "link de agendamento barbearia",
  "retenção de clientes barbearia",
  "sistema de agendamento para barbearias",
];

export const SITE_TAGLINE = "Seu cliente sempre de volta.";

export const PRODUCT_SUMMARY =
  "A VOLTTA é um software SaaS para barbearias e barbeiros no Brasil. Oferece agenda online, link público de agendamento, CRM de clientes e leads, WhatsApp automatizado (confirmações, lembretes e campanhas de retorno), Score de risco de abandono, dashboard financeiro e gestão de até 5 profissionais. O plano custa R$ 79,90/mês, com 7 dias de teste grátis e sem fidelidade.";

export const OG_IMAGE_PATH = "/marketing/hero-barbershop.jpg";
export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`;
export const OG_IMAGE_ALT =
  "Voltta: sistema de agendamento online e automação para barbearias";

export const AI_TOPICS = [
  "sistema para barbearia",
  "software de gestão para barbearia",
  "agenda online para barbeiro",
  "agendamento online para barbearia",
  "CRM para barbearia",
  "WhatsApp automático para barbearia",
  "recuperação de clientes de barbearia",
  "link público de agendamento",
  "aumentar recorrência de clientes na barbearia",
  "alternativa a agenda só com WhatsApp manual",
];

export const LANDING_FAQS = [
  {
    question: "O que é a VOLTTA?",
    answer:
      "A VOLTTA é um sistema para barbearia com agenda online, link público de agendamento, WhatsApp automático e CRM, feito para trazer clientes de volta e reduzir horários vazios.",
  },
  {
    question: "A VOLTTA serve para barbearias pequenas?",
    answer:
      "Sim. O plano atual permite até 5 profissionais e foi pensado para micro e pequenas barbearias que querem organizar a agenda e automatizar o relacionamento no WhatsApp.",
  },
  {
    question: "O cliente consegue agendar sozinho?",
    answer:
      "Sim. Cada barbearia recebe um link público exclusivo. O cliente escolhe serviço, profissional, horário e confirma sem precisar trocar mensagens.",
  },
  {
    question: "A VOLTTA envia mensagens no WhatsApp automaticamente?",
    answer:
      "Sim. Depois de conectar o WhatsApp, a VOLTTA pode enviar confirmações, lembretes, retornos e outras automações sem trabalho manual.",
  },
  {
    question: "Quanto custa a VOLTTA?",
    answer:
      "O plano VOLTTA custa R$ 79,90 por mês, com 7 dias de teste grátis, sem fidelidade e com cancelamento quando quiser.",
  },
  {
    question: "Preciso instalar algum aplicativo?",
    answer:
      "Não. A VOLTTA funciona no navegador, no celular, tablet ou computador.",
  },
];

/** Schema.org SoftwareApplication — bloco dedicado pedido para SEO */
export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Voltta",
    alternateName: ["VOLTTA", "Voltta Barbearia", "Sistema Voltta"],
    description: PRODUCT_SUMMARY,
    url: SITE_URL,
    image: [`${SITE_URL}/marketing/hero-barbershop.webp`, OG_IMAGE_URL],
    screenshot: `${SITE_URL}/marketing/feature-barber.webp`,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Barbershop management and scheduling software",
    operatingSystem: "Web, iOS, Android",
    browserRequirements: "Requires JavaScript. Works on modern browsers.",
    softwareVersion: "1.0",
    inLanguage: "pt-BR",
    availableLanguage: ["pt-BR"],
    countriesSupported: "BR",
    isAccessibleForFree: false,
    offers: {
      "@type": "Offer",
      name: "Plano VOLTTA",
      price: "79.90",
      priceCurrency: "BRL",
      url: `${SITE_URL}/signup`,
      availability: "https://schema.org/InStock",
      category: "SaaS Subscription",
      priceValidUntil: "2027-12-31",
      description:
        "Plano mensal com agenda online, WhatsApp automático, CRM e 7 dias de teste grátis",
      eligibleRegion: {
        "@type": "Country",
        name: "BR",
      },
    },
    audience: {
      "@type": "BusinessAudience",
      audienceType:
        "Barbearias, barbeiros e donos de negócio de beleza masculina no Brasil",
    },
    featureList: [
      "Sistema de agendamento online para barbearias",
      "Link público de agendamento 24h",
      "Automação de mensagens no WhatsApp",
      "Confirmação e lembrete de horário",
      "CRM e captação de leads",
      "Score de risco de abandono de clientes",
      "Dashboard e financeiro",
      "Gestão de até 5 profissionais",
    ],
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/marketing/hero-barbershop.webp`,
      },
    },
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    keywords: SITE_KEYWORDS.join(", "),
    installUrl: `${SITE_URL}/signup`,
    softwareHelp: {
      "@type": "WebPage",
      name: "Começar com a VOLTTA",
      url: `${SITE_URL}/signup`,
    },
  };
}

export function jsonLdGraph() {
  const orgId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const webpageId = `${SITE_URL}/#webpage`;
  const appId = `${SITE_URL}/#software`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: SITE_NAME,
        legalName: "VOLTTA",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/marketing/hero-barbershop.webp`,
          width: 1536,
          height: 1024,
        },
        description: SITE_DESCRIPTION,
        slogan: SITE_TAGLINE,
        areaServed: {
          "@type": "Country",
          name: "Brazil",
        },
        knowsAbout: AI_TOPICS,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "pt-BR",
        publisher: { "@id": orgId },
        potentialAction: {
          "@type": "RegisterAction",
          target: `${SITE_URL}/signup`,
          name: "Começar teste grátis VOLTTA",
        },
      },
      {
        "@type": "WebPage",
        "@id": webpageId,
        url: SITE_URL,
        name: SITE_TITLE,
        description: SITE_DESCRIPTION,
        inLanguage: "pt-BR",
        isPartOf: { "@id": websiteId },
        about: { "@id": appId },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE_URL}/marketing/hero-barbershop.webp`,
          width: 1536,
          height: 1024,
        },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "h2"],
        },
      },
      {
        "@type": ["SoftwareApplication", "WebApplication"],
        "@id": appId,
        name: SITE_NAME,
        alternateName: "Voltta",
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Barbershop management software",
        operatingSystem: "Web",
        browserRequirements: "Requires JavaScript",
        url: SITE_URL,
        image: `${SITE_URL}/marketing/hero-barbershop.webp`,
        screenshot: `${SITE_URL}/marketing/feature-whatsapp.webp`,
        description: PRODUCT_SUMMARY,
        featureList: [
          "Agenda online 24h",
          "Link público de agendamento",
          "WhatsApp automatizado",
          "CRM de clientes e leads",
          "Score VOLTTA de risco de abandono",
          "Dashboard e financeiro",
          "Gestão de até 5 profissionais",
        ],
        offers: {
          "@type": "Offer",
          price: "79.90",
          priceCurrency: "BRL",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/signup`,
          description: "Plano mensal VOLTTA com 7 dias de teste grátis",
        },
        provider: { "@id": orgId },
        audience: {
          "@type": "Audience",
          audienceType:
            "Barbearias, barbeiros e donos de negócio de beleza masculina",
        },
        keywords: SITE_KEYWORDS.join(", "),
        inLanguage: "pt-BR",
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        isPartOf: { "@id": webpageId },
        mainEntity: LANDING_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };
}
