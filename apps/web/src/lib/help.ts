export type TourStep = {
  id: string;
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  hintMobile: string;
  hintDesktop: string;
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: "dashboard",
    href: "/dashboard",
    eyebrow: "COMEÇOU",
    title: "BEM-VINDO À VOLTTA",
    body: "Em um minuto você vê o mapa do app. Sem aula longa: é o seu negócio, agora com memória de quem volta e quem sumiu.",
    hintMobile: "No celular, o menu fica no ☰ no canto superior esquerdo.",
    hintDesktop: "O menu completo fica à esquerda. O tour abre cada tela para você ver o que é o quê.",
  },
  {
    id: "agenda",
    href: "/agenda",
    eyebrow: "AGENDA",
    title: "O PALCO DO DIA",
    body: "Aqui entram os horários. Você marca na mão ou o cliente marca sozinho pelo link público. Um clique no horário abre os detalhes.",
    hintMobile: "Menu ☰ → Agenda. Role a página para ver o dia; o cartão de baixo não trava a tela.",
    hintDesktop: "Menu à esquerda → Agenda. A lista do dia e o formulário de novo horário ficam nesta tela.",
  },
  {
    id: "clientes",
    href: "/clientes",
    eyebrow: "CLIENTES",
    title: "QUEM JÁ PASSOU POR AQUI",
    body: "Cada nome é chance de voltar. Cadastre com nome e WhatsApp. A VOLTTA usa isso para lembrar quem está sumindo.",
    hintMobile: "Menu ☰ → Clientes. O formulário Novo cliente fica abaixo da lista — role um pouco.",
    hintDesktop: "Menu à esquerda → Clientes. A lista fica à esquerda e o cadastro novo, à direita.",
  },
  {
    id: "servicos",
    href: "/servicos",
    eyebrow: "SERVIÇOS",
    title: "O QUE VOCÊ VENDE",
    body: "Corte, coloração, cílios… preço, duração e de quantos em quantos dias a pessoa deve voltar. Esse intervalo alimenta o retorno automático.",
    hintMobile: "Menu ☰ → Serviços. No celular, “Novo serviço” aparece depois da lista.",
    hintDesktop: "Menu à esquerda → Serviços. Cadastre à direita; a lista de serviços fica ao lado.",
  },
  {
    id: "whatsapp",
    href: "/whatsapp",
    eyebrow: "WHATSAPP",
    title: "O TELEFONE QUE TRABALHA",
    body: "Conecte o WhatsApp do negócio com o QR. Confirmação, lembrete e “faz tempo, né?” saem daqui — não do seu dedo a cada cliente.",
    hintMobile: "Use o celular do negócio para escanear. O QR fica nesta mesma tela, abaixo do botão Conectar.",
    hintDesktop: "Clique em Conectar WhatsApp. O QR aparece à direita — escaneie com o celular do negócio.",
  },
  {
    id: "automacoes",
    href: "/automacoes",
    eyebrow: "AUTOMAÇÕES",
    title: "A VOLTTA NO PILOTO",
    body: "As regras já nasceram com a sua conta. Com o WhatsApp ligado, elas disparam sozinhas. Você só ajusta o texto, se quiser.",
    hintMobile: "Menu ☰ → Automações. Toque numa regra para ver a mensagem que o cliente recebe.",
    hintDesktop: "Menu à esquerda → Automações. Clique numa regra para ler e editar a mensagem.",
  },
];

export type GuideId =
  | "whatsapp"
  | "catalog"
  | "booking"
  | "automations"
  | "link";

export type Guide = {
  id: GuideId;
  title: string;
  blurb: string;
  href: string;
  cta: string;
  steps: string[];
  doneKey: keyof SetupProgress;
};

export type SetupProgress = {
  tourCompleted: boolean;
  hasPhoneOrLogo: boolean;
  hasService: boolean;
  hasCustomer: boolean;
  hasAppointment: boolean;
  whatsappConnected: boolean;
};

export const GUIDES: Guide[] = [
  {
    id: "catalog",
    title: "Cadastrar serviços",
    blurb: "Sem serviço não tem agenda nem preço no link público.",
    href: "/servicos",
    cta: "Abrir serviços",
    doneKey: "hasService",
    steps: [
      "Abra Serviços (menu à esquerda no computador, ou ☰ no celular).",
      "Preencha Novo serviço: no computador fica ao lado da lista; no celular, role até embaixo.",
      "Nome, preço e duração. No intervalo de retorno, coloque de quantos em quantos dias a pessoa costuma voltar — é isso que dispara o lembrete.",
      "Clique em Adicionar serviço. Repita para os principais.",
    ],
  },
  {
    id: "booking",
    title: "Cadastrar e agendar um cliente",
    blurb: "O primeiro horário deixa a VOLTTA viva: confirmação e lembrete passam a fazer sentido.",
    href: "/agenda",
    cta: "Abrir agenda",
    doneKey: "hasAppointment",
    steps: [
      "Primeiro cadastre o cliente: Clientes → Novo cliente (nome + WhatsApp).",
      "Depois abra Agenda no mesmo menu.",
      "Escolha profissional, serviço e um horário livre. Confirme.",
      "Se o WhatsApp já estiver conectado, a confirmação sai sozinha.",
    ],
  },
  {
    id: "whatsapp",
    title: "Conectar o WhatsApp",
    blurb: "É o motor das mensagens. Sem isso, as automações ficam no banco.",
    href: "/whatsapp",
    cta: "Abrir WhatsApp",
    doneKey: "whatsappConnected",
    steps: [
      "Abra WhatsApp no menu e clique em Conectar WhatsApp.",
      "Pegue o celular do negócio (o número que os clientes conhecem).",
      "Nesse celular: WhatsApp → Aparelhos conectados → Conectar um aparelho.",
      "Aponte a câmera para o QR desta tela. Quando aparecer “conectado”, mande uma mensagem de teste.",
    ],
  },
  {
    id: "automations",
    title: "Revisar as automações",
    blurb: "Confirmação, lembrete, retorno e aniversário já existem. Você só confere o texto.",
    href: "/automacoes",
    cta: "Abrir automações",
    doneKey: "whatsappConnected",
    steps: [
      "Abra Automações. As regras A1 a A5 já vieram prontas.",
      "Abra uma regra e leia a mensagem. Pode deixar do seu jeito, com {{nome}}, {{data}}, {{hora}} e {{link}}.",
      "O retorno (A4) usa o intervalo que você cadastrou no serviço.",
      "Ligue o WhatsApp para elas saírem de verdade. Sem WhatsApp, nada é enviado.",
    ],
  },
  {
    id: "link",
    title: "Compartilhar o link de agendamento",
    blurb: "O cliente marca sozinho. Você cola na bio do Instagram e no WhatsApp.",
    href: "/configuracoes",
    cta: "Ver meu link",
    doneKey: "hasService",
    steps: [
      "Cadastre pelo menos um serviço — senão o link não tem o que oferecer.",
      "No Dashboard ou em Configurações, copie o link /b/seu-negocio.",
      "Cole na bio, no status e na resposta automática do WhatsApp.",
      "Peça para um amigo testar no celular: escolher serviço, horário e confirmar.",
    ],
  },
];

export function setupDoneCount(progress: SetupProgress) {
  const flags = [
    progress.hasService,
    progress.hasCustomer,
    progress.hasAppointment,
    progress.whatsappConnected,
  ];
  return flags.filter(Boolean).length;
}

export const SETUP_GOAL = 4;
