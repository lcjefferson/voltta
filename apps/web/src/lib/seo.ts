export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://volttaagenda.fortallabs.com.br";

export const SITE_NAME = "VOLTTA";

/** Title Tag — keyword principal no início + marca */
export const SITE_TITLE =
  "Voltta: Sistema de Agendamento Online para Barbearias, Salões e Estética";

/** Meta Description — ~155 chars, CTA + keywords do nicho */
export const SITE_DESCRIPTION =
  "Voltta é o sistema de agendamento online, automação WhatsApp e retenção para barbearias, salões e profissionais de estética. Teste grátis 7 dias.";

/** H1 canônico da landing (visível, único) */
export const LANDING_H1 =
  "Sistema de agendamento online e automação WhatsApp para barbearias, salões e estética";

export const SITE_KEYWORDS = [
  "sistema para barbearia",
  "sistema para salão de beleza",
  "agenda para estética",
  "agenda online manicure",
  "agendamento online cílios",
  "software para salão",
  "CRM para barbearia",
  "WhatsApp para salão de beleza",
  "automação WhatsApp estética",
  "link de agendamento salão",
  "retenção de clientes beleza",
  "sistema de agendamento para profissionais de beleza",
];

export const SITE_TAGLINE = "Seu cliente sempre de volta.";

export const PRODUCT_SUMMARY =
  "A VOLTTA é um software SaaS para barbearias, salões de beleza e profissionais de estética (manicure, cílios, sobrancelha e afins) no Brasil. Oferece agenda online, link público de agendamento, CRM de clientes e leads, WhatsApp automatizado (confirmações, lembretes e campanhas de retorno), Score de risco de abandono, dashboard financeiro e gestão de até 5 profissionais. O plano custa R$ 79,90/mês, com 7 dias de teste grátis e sem fidelidade.";

export const OG_IMAGE_PATH = "/marketing/hero-beauty.jpg";
export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`;
export const OG_IMAGE_ALT =
  "Voltta: sistema de agendamento online e automação para barbearias, salões e estética";

export const AI_TOPICS = [
  "sistema para barbearia",
  "software de gestão para salão de beleza",
  "agenda online para manicure",
  "agendamento online para estética",
  "CRM para profissionais de beleza",
  "WhatsApp automático para salão",
  "recuperação de clientes de estética",
  "link público de agendamento",
  "aumentar recorrência de clientes na beleza",
  "alternativa a agenda só com WhatsApp manual",
];

export const LANDING_FAQS = [
  {
    question: "O que é a VOLTTA?",
    answer:
      "A VOLTTA é um sistema de agenda online, link público de agendamento, WhatsApp automático e CRM para barbearias, salões e profissionais de estética — feito para trazer clientes de volta e reduzir horários vazios.",
  },
  {
    question: "A VOLTTA serve para salão e estética, ou só barbearia?",
    answer:
      "Serve para os três. O mesmo produto atende barbearias, salões de beleza e profissionais de estética (manicure, cílios, sobrancelha, etc.), com até 5 profissionais no plano.",
  },
  {
    question: "O cliente consegue agendar sozinho?",
    answer:
      "Sim. Cada negócio recebe um link público exclusivo. O cliente escolhe serviço, profissional, horário e confirma sem precisar trocar mensagens.",
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
    alternateName: ["VOLTTA", "Voltta Agenda", "Sistema Voltta"],
    description: PRODUCT_SUMMARY,
    url: SITE_URL,
    image: [`${SITE_URL}/marketing/hero-beauty.webp`, OG_IMAGE_URL],
    screenshot: `${SITE_URL}/marketing/feature-salon.webp`,
    applicationCategory: "BusinessApplication",
    applicationSubCategory:
      "Beauty business management and scheduling software",
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
        "Barbearias, salões de beleza e profissionais de estética no Brasil",
    },
    featureList: [
      "Sistema de agendamento online para beleza",
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
        url: `${SITE_URL}/marketing/hero-beauty.webp`,
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
          url: `${SITE_URL}/marketing/hero-beauty.webp`,
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
          url: `${SITE_URL}/marketing/hero-beauty.webp`,
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
        applicationSubCategory: "Beauty business management software",
        operatingSystem: "Web",
        browserRequirements: "Requires JavaScript",
        url: SITE_URL,
        image: `${SITE_URL}/marketing/hero-beauty.webp`,
        screenshot: `${SITE_URL}/marketing/feature-whatsapp.webp`,
        description: PRODUCT_SUMMARY,
        offers: {
          "@type": "Offer",
          price: "79.90",
          priceCurrency: "BRL",
          url: `${SITE_URL}/signup`,
        },
        audience: {
          "@type": "BusinessAudience",
          audienceType:
            "Barbearias, salões e profissionais de estética no Brasil",
        },
        publisher: { "@id": orgId },
      },
      {
        "@type": "FAQPage",
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
