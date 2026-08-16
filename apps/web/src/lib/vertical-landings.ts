import { SITE_URL } from "@/lib/seo";

export type VerticalSlug =
  | "para-barbearias"
  | "para-saloes"
  | "para-estetica";

export type VerticalLanding = {
  slug: VerticalSlug;
  path: `/${VerticalSlug}`;
  /** Label curto nos links */
  navLabel: string;
  /** Tipo de negócio */
  audience: string;
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  h1Accent: string;
  support: string;
  problemEyebrow: string;
  problemTitle: string;
  problemTitleAccent: string;
  problemBody: string;
  problemClose: string;
  painPoints: string[];
  benefits: { title: string; text: string }[];
  howItWorks: { title: string; text: string }[];
  faqs: { question: string; answer: string }[];
  ctaTitle: string;
  ctaBody: string;
  heroAlt: string;
};

export const VERTICAL_LANDINGS: Record<VerticalSlug, VerticalLanding> = {
  "para-barbearias": {
    slug: "para-barbearias",
    path: "/para-barbearias",
    navLabel: "Barbearias",
    audience: "barbearias",
    title:
      "Sistema de Agendamento Online para Barbearias | Voltta",
    description:
      "Agenda online, WhatsApp automático e retenção para barbearias. Confirmações, lembretes e clientes de volta — teste grátis 7 dias.",
    keywords: [
      "sistema para barbearia",
      "agenda online para barbearia",
      "agendamento online barbeiro",
      "software para barbearia",
      "WhatsApp automático barbearia",
      "CRM para barbearia",
      "retenção de clientes barbearia",
      "link de agendamento barbearia",
    ],
    h1: "Sistema de agendamento online",
    h1Accent: "para barbearias",
    support:
      "Organize a agenda, automatize o WhatsApp e recupere quem sumiu depois do corte — sem viver respondendo mensagem.",
    problemEyebrow: "O VERDADEIRO PROBLEMA",
    problemTitle: "SUA CADEIRA NÃO FICA VAZIA POR FALTA DE CORTE.",
    problemTitleAccent: "FICA VAZIA PORQUE O CLIENTE ESQUECE.",
    problemBody:
      "Ele gostou do fade, da conversa, do ambiente. Mas a vida corre — e o retorno some. Você perde recorrência sem perceber.",
    problemClose: "A VOLTTA faz ele lembrar. Automaticamente.",
    painPoints: [
      "Cliente pergunta “tem horário?” o dia inteiro no WhatsApp",
      "Faltas e atrasos porque ninguém lembrou com antecedência",
      "Cliente some 40–60 dias e você só descobre na cadeira vazia",
      "Agenda no caderno ou no Instagram sem visão do caixa",
    ],
    benefits: [
      {
        title: "Link público 24h",
        text: "Cliente marca corte, barba ou combo sozinho — até de madrugada.",
      },
      {
        title: "WhatsApp que trabalha",
        text: "Confirmação, lembrete e campanha de retorno sem digitar.",
      },
      {
        title: "Equipe na agenda",
        text: "Até 5 profissionais com horários e serviços organizados.",
      },
      {
        title: "Score de risco",
        text: "Veja quem está esfriando e mande a mensagem na hora certa.",
      },
    ],
    howItWorks: [
      {
        title: "Cliente agenda",
        text: "Pelo link da barbearia: serviço, barbeiro e horário.",
      },
      {
        title: "VOLTTA confirma",
        text: "Mensagens automáticas no WhatsApp antes do horário.",
      },
      {
        title: "Cliente volta",
        text: "Campanha de retorno quando o intervalo do serviço passa.",
      },
    ],
    faqs: [
      {
        question: "A VOLTTA serve para barbearia pequena?",
        answer:
          "Sim. O plano atual permite até 5 profissionais e foi pensado para barbearias que querem organizar a agenda e automatizar o WhatsApp sem complicar.",
      },
      {
        question: "O cliente consegue agendar sozinho?",
        answer:
          "Sim. Cada barbearia recebe um link público. O cliente escolhe serviço, profissional e horário sem ficar no bate-papo.",
      },
      {
        question: "Dá para lembrar o cliente de voltar para o corte?",
        answer:
          "Sim. Você configura o intervalo de retorno no serviço e a VOLTTA dispara a campanha no WhatsApp automaticamente.",
      },
      {
        question: "Quanto custa?",
        answer:
          "R$ 79,90/mês, com 7 dias de teste grátis, sem fidelidade.",
      },
    ],
    ctaTitle: "QUANTOS CORTES VOCÊ PERDEU ESTE MÊS?",
    ctaBody:
      "Se não souber responder, está deixando dinheiro na cadeira. Comece o teste e veja a diferença na agenda da barbearia.",
    heroAlt:
      "Interior de barbearia com sistema de agendamento online Voltta",
  },
  "para-saloes": {
    slug: "para-saloes",
    path: "/para-saloes",
    navLabel: "Salões",
    audience: "salões de beleza",
    title:
      "Sistema de Agendamento Online para Salões de Beleza | Voltta",
    description:
      "Agenda online, WhatsApp automático e retenção para salões de beleza. Organize a equipe e traga clientes de volta — teste grátis 7 dias.",
    keywords: [
      "sistema para salão de beleza",
      "agenda online para salão",
      "agendamento online salão de beleza",
      "software para salão",
      "WhatsApp automático salão",
      "CRM para salão de beleza",
      "gestão de salão de beleza",
      "link de agendamento salão",
    ],
    h1: "Sistema de agendamento online",
    h1Accent: "para salões de beleza",
    support:
      "Agenda da equipe, link público e WhatsApp automático — para o salão encher de novo sem bagunça no atendimento.",
    problemEyebrow: "O VERDADEIRO PROBLEMA",
    problemTitle: "O SALÃO NÃO PRECISA SÓ DE CLIENTES NOVOS.",
    problemTitleAccent: "PRECISA DOS QUE JÁ CONHECEM O SERVIÇO.",
    problemBody:
      "Coloração, escova, tratamento: a cliente ama o resultado, mas a rotina engole o retorno. Horários vagos aparecem sem aviso.",
    problemClose: "A VOLTTA organiza a agenda e faz a cliente lembrar.",
    painPoints: [
      "Agenda da equipe espalhada no WhatsApp e no Instagram",
      "Cliente remarca em cima da hora e o dia desmonta",
      "Retornos de coloração e tratamento sem controle",
      "Recepcionista saturada confirmando horário um a um",
    ],
    benefits: [
      {
        title: "Agenda da equipe",
        text: "Profissionais, serviços e horários no mesmo lugar.",
      },
      {
        title: "Link do salão",
        text: "Cliente marca sozinha — sem fila no direct.",
      },
      {
        title: "WhatsApp automático",
        text: "Confirmação, lembrete e retorno sem a equipe digitar.",
      },
      {
        title: "CRM + leads",
        text: "Quem manda mensagem vira lead e depois cliente.",
      },
    ],
    howItWorks: [
      {
        title: "Cliente agenda",
        text: "Pelo link do salão: serviço, profissional e horário.",
      },
      {
        title: "Equipe foca no atendimento",
        text: "A VOLTTA confirma e lembra no WhatsApp.",
      },
      {
        title: "Retorno na hora certa",
        text: "Campanhas quando o intervalo do serviço chega.",
      },
    ],
    faqs: [
      {
        question: "A VOLTTA serve para salão com vários profissionais?",
        answer:
          "Sim. O plano permite até 5 profissionais na agenda e no agendamento online, com serviços e horários por pessoa.",
      },
      {
        question: "Dá para usar no WhatsApp do salão?",
        answer:
          "Sim. Você conecta o WhatsApp Business do salão e as automações saem por ali — confirmações, lembretes e retornos.",
      },
      {
        question: "Substitui a recepção?",
        answer:
          "Não substitui o atendimento humano. Remove o trabalho repetitivo de confirmar horário e lembrar retorno, para a equipe focar na cliente.",
      },
      {
        question: "Quanto custa?",
        answer:
          "R$ 79,90/mês, com 7 dias de teste grátis, sem fidelidade.",
      },
    ],
    ctaTitle: "QUANTOS HORÁRIOS FICARAM VAZIOS ESTE MÊS?",
    ctaBody:
      "Comece o teste e veja a diferença na agenda do salão — com menos WhatsApp manual e mais recorrência.",
    heroAlt:
      "Salão de beleza com agenda online e automação WhatsApp Voltta",
  },
  "para-estetica": {
    slug: "para-estetica",
    path: "/para-estetica",
    navLabel: "Estética",
    audience: "profissionais de estética",
    title:
      "Sistema de Agendamento Online para Estética, Manicure e Cílios | Voltta",
    description:
      "Agenda online e WhatsApp automático para manicure, cílios, sobrancelha e estética. Lembretes e retorno na hora certa — teste grátis 7 dias.",
    keywords: [
      "agenda para manicure",
      "agendamento online cílios",
      "sistema para estética",
      "software para manicure",
      "WhatsApp automático estética",
      "agenda online sobrancelha",
      "retenção de clientes estética",
      "link de agendamento manicure",
    ],
    h1: "Sistema de agendamento online",
    h1Accent: "para estética, manicure e cílios",
    support:
      "Ideal para quem vive de retorno: manicure, alongamento, cílios, sobrancelha e procedimentos com prazo.",
    problemEyebrow: "O VERDADEIRO PROBLEMA",
    problemTitle: "SEU FATURAMENTO DEPENDE DE RETORNO.",
    problemTitleAccent: "E RETORNO DEPENDE DE LEMBRETE.",
    problemBody:
      "Unha, cílios e procedimentos têm prazo. Se a cliente esquece, o horário some — e você só vê no fim do mês.",
    problemClose: "A VOLTTA lembra a cliente no intervalo certo do serviço.",
    painPoints: [
      "Agenda no WhatsApp pessoal, difícil de escalar",
      "Cliente some na manutenção de cílios ou unha",
      "Falta de lembrete gera buraco na semana",
      "Sem visão clara de quem está em risco de não voltar",
    ],
    benefits: [
      {
        title: "Intervalo por serviço",
        text: "Configure o retorno da manicure, cílios ou procedimento.",
      },
      {
        title: "WhatsApp automático",
        text: "Confirmação, lembrete e campanha de manutenção.",
      },
      {
        title: "Link público",
        text: "Cliente agenda sozinha pelo Instagram ou bio.",
      },
      {
        title: "CRM simples",
        text: "Histórico e leads sem planilha.",
      },
    ],
    howItWorks: [
      {
        title: "Cliente agenda",
        text: "Pelo seu link: serviço e horário disponíveis.",
      },
      {
        title: "Você atende",
        text: "A VOLTTA confirma e lembra no WhatsApp.",
      },
      {
        title: "Manutenção no prazo",
        text: "Quando o intervalo chega, a mensagem de retorno sai sozinha.",
      },
    ],
    faqs: [
      {
        question: "Serve para manicure e designer de cílios?",
        answer:
          "Sim. A VOLTTA foi pensada para profissionais de estética com agenda recorrente — manicure, cílios, sobrancelha e afins.",
      },
      {
        question: "Consigo definir o prazo de retorno de cada serviço?",
        answer:
          "Sim. No cadastro do serviço você informa o intervalo em dias. A campanha de retorno usa esse prazo automaticamente.",
      },
      {
        question: "Funciona se eu trabalho sozinha?",
        answer:
          "Sim. Muitos profissionais solo usam o link público e o WhatsApp automático para parar de confirmar horário à mão.",
      },
      {
        question: "Quanto custa?",
        answer:
          "R$ 79,90/mês, com 7 dias de teste grátis, sem fidelidade.",
      },
    ],
    ctaTitle: "QUANTAS MANUTENÇÕES VOCÊ PERDEU ESTE MÊS?",
    ctaBody:
      "Comece o teste e coloque lembrete e retorno no piloto automático do seu estúdio.",
    heroAlt:
      "Estúdio de estética com agendamento online e lembretes WhatsApp Voltta",
  },
};

export const VERTICAL_LIST = Object.values(VERTICAL_LANDINGS);

export function verticalCanonical(slug: VerticalSlug) {
  return `${SITE_URL}/${slug}`;
}

export function verticalJsonLd(landing: VerticalLanding) {
  const url = verticalCanonical(landing.slug);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: landing.title,
        description: landing.description,
        inLanguage: "pt-BR",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: {
          "@type": "SoftwareApplication",
          name: "Voltta",
          applicationCategory: "BusinessApplication",
          offers: {
            "@type": "Offer",
            price: "79.90",
            priceCurrency: "BRL",
          },
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: landing.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Início",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: landing.navLabel,
            item: url,
          },
        ],
      },
    ],
  };
}
