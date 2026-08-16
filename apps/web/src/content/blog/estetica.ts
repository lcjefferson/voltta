import type { BlogPostMeta } from "@/lib/blog/types";
import { NICHE_COVER } from "@/lib/blog/types";

type Section =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export type NichePost = BlogPostMeta & { sections: Section[] };

export const esteticaPosts: NichePost[] = [
  {
    slug: "agenda-para-manicure",
    niche: "estetica",
    title: "Agenda para manicure: organize horários e retornos sem bagunça",
    description:
      "Como montar uma agenda para manicure que respeita o tempo de cada serviço, evita overbooking e facilita o retorno das clientes a cada 15–21 dias.",
    keywords: [
      "agenda para manicure",
      "organizar agenda manicure",
      "horários manicure",
      "retorno manicure",
    ],
    publishedAt: "2026-06-01",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "Uma agenda para manicure bem montada é o que separa o dia corrido do dia caótico. Quando você atende esmaltação, alongamento, spa dos pés e manutenção no mesmo período, o tempo de cada serviço muda — e a agenda precisa refletir isso.",
      },
      {
        type: "h2",
        text: "Defina duração realista por serviço",
      },
      {
        type: "p",
        text: "Comece medindo quanto tempo você realmente leva, não o que “deveria” levar. Inclua preparação da mesa, higienização e um buffer de 5 a 10 minutos entre clientes. Assim você reduz atraso em cascata e chega no fim do dia com menos estresse.",
      },
      {
        type: "ul",
        items: [
          "Esmaltação simples: 40–60 minutos",
          "Manutenção de alongamento: 60–90 minutos",
          "Alongamento novo: 90–120 minutos",
          "Spa dos pés + esmaltação: 75–100 minutos",
        ],
      },
      {
        type: "h2",
        text: "Planeje o intervalo de retorno na hora do atendimento",
      },
      {
        type: "p",
        text: "A maioria das clientes de manicure precisa voltar a cada 15 a 21 dias, dependendo do crescimento da unha e do tipo de serviço. Ao finalizar o atendimento, já reserve o próximo horário ou envie um lembrete de manutenção. Isso transforma agenda cheia em receita recorrente.",
      },
      {
        type: "h2",
        text: "Bloqueios e regras que evitam overbooking",
      },
      {
        type: "ul",
        items: [
          "Reserve blocos para manutenção (mais previsível) e blocos para serviços novos",
          "Limite encaixes no mesmo horário se você trabalha sozinha",
          "Marque pausas para almoço e reposição de materiais",
          "Use cores ou tags por tipo de serviço para visualizar o dia de relance",
        ],
      },
      {
        type: "p",
        text: "Com uma agenda clara e retornos programados, você deixa de depender só do WhatsApp improvisado. Ferramentas como a VOLTTA ajudam a centralizar horários e lembretes sem complicar o fluxo do estúdio.",
      },
    ],
  },
  {
    slug: "agendamento-online-cilios",
    niche: "estetica",
    title: "Agendamento online de cílios: menos mensagens, mais manutenções",
    description:
      "Guia prático de agendamento online para designer de cílios, com foco em volume, mapping e retorno a cada 15–20 dias.",
    keywords: [
      "agendamento online cílios",
      "agenda designer de cílios",
      "marcar horário cílios",
      "manutenção de cílios",
    ],
    publishedAt: "2026-06-05",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "Quem faz extensão de cílios sabe: o WhatsApp vira uma fila infinita de “tem horário?”, “quanto tempo demora?” e “quando posso voltar pra manutenção?”. O agendamento online organiza isso e libera sua atenção para o mapeamento e a aplicação.",
      },
      {
        type: "h2",
        text: "Por que cílios pedem agenda digital",
      },
      {
        type: "p",
        text: "Procedimentos de volume brasileiro, volume russo e fio a fio têm durações diferentes. Sem um sistema, é fácil marcar duas clientes com sobreposição ou esquecer o tempo de preparação do ambiente. Online, a cliente escolhe o serviço certo e vê só os horários disponíveis.",
      },
      {
        type: "ul",
        items: [
          "Separe slots de aplicação nova e de manutenção",
          "Peça preferência de estilo (natural, glam, volume) no formulário",
          "Informe política de atraso e remarcação antes da confirmação",
          "Deixe claro o intervalo ideal de retorno (15 a 20 dias)",
        ],
      },
      {
        type: "h2",
        text: "Manutenção: o coração da recorrência",
      },
      {
        type: "p",
        text: "A extensão perde volume conforme o ciclo natural do fio. Clientes que retornam entre 15 e 20 dias mantêm o visual e você mantém a agenda previsível. No agendamento online, ofereça o próximo horário logo após o atendimento ou envie um link de remarcação.",
      },
      {
        type: "h2",
        text: "Checklist antes de abrir a agenda",
      },
      {
        type: "ul",
        items: [
          "Defina duração de cada técnica com margem de 10 minutos",
          "Bloqueie horários de limpeza e esterilização de pinças",
          "Inclua foto de portfólio e preço por serviço na página de agendamento",
          "Ative confirmação automática para reduzir no-show",
        ],
      },
      {
        type: "p",
        text: "Com agendamento online bem configurado, você reduz ida e volta de mensagens e preenche a semana com manutenções no ritmo certo — e a VOLTTA pode ser o canal para isso sem sair do fluxo que a cliente já conhece.",
      },
    ],
  },
  {
    slug: "sistema-para-estetica",
    niche: "estetica",
    title: "Sistema para estética: o que não pode faltar no estúdio",
    description:
      "O que um sistema para estética precisa ter: agenda, clientes, lembretes de manutenção e visão de recorrência para manicure, cílios e sobrancelha.",
    keywords: [
      "sistema para estética",
      "sistema estúdio estética",
      "gestão estética",
      "software estética",
    ],
    publishedAt: "2026-06-09",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "Um sistema para estética não é luxo: é o que impede caderno rasgado, horário duplicado e cliente sumida no ciclo de manutenção. Manicure, cílios e sobrancelha vivem de retorno — e o sistema precisa refletir isso.",
      },
      {
        type: "h2",
        text: "Funções essenciais no dia a dia",
      },
      {
        type: "ul",
        items: [
          "Agenda por profissional e por serviço",
          "Cadastro de clientes com histórico de procedimentos",
          "Lembretes de retorno (unhas 15–21 dias, cílios 15–20, sobrancelha 20–30)",
          "Confirmação e reagendamento sem troca interminável de mensagens",
          "Visão simples de ocupação da semana",
        ],
      },
      {
        type: "h2",
        text: "Histórico que melhora o atendimento",
      },
      {
        type: "p",
        text: "Anote preferências: formato de unha, cor favorita, volume de cílios, formato de sobrancelha e alergias. No próximo retorno, você já chega preparada e a cliente sente cuidado personalizado — o que aumenta fidelização.",
      },
      {
        type: "h2",
        text: "Como escolher sem se perder em recursos",
      },
      {
        type: "p",
        text: "Priorize o que você usa todos os dias. Relatórios avançados podem esperar; agenda confiável e lembrete de manutenção não. Teste se o fluxo cabe no celular, porque a maioria das profissionais gerencia o estúdio longe do computador.",
      },
      {
        type: "ul",
        items: [
          "Prefira interface rápida no WhatsApp ou no celular",
          "Evite sistemas que exigem planilha paralela",
          "Confirme se dá para enviar link de agendamento às clientes",
          "Verifique se o retorno pode ser sugerido automaticamente",
        ],
      },
      {
        type: "p",
        text: "Quando o sistema acompanha o ritmo de manutenção do estúdio, a agenda deixa de ser apagar incêndio e passa a ser previsibilidade. A VOLTTA foi pensada exatamente para esse tipo de operação enxuta.",
      },
    ],
  },
  {
    slug: "software-para-manicure",
    niche: "estetica",
    title: "Software para manicure: controle agenda, clientes e retorno",
    description:
      "Como um software para manicure ajuda a organizar horários, lembrar manutenção a cada 15–21 dias e profissionalizar o atendimento.",
    keywords: [
      "software para manicure",
      "app manicure agenda",
      "programa para manicure",
      "organizar manicure",
    ],
    publishedAt: "2026-06-13",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "Software para manicure não precisa ser complicado. O objetivo é simples: saber quem vem, quanto tempo cada serviço leva e quando a cliente deve voltar para não perder o ciclo de manutenção.",
      },
      {
        type: "h2",
        text: "Problemas que o software resolve",
      },
      {
        type: "ul",
        items: [
          "Horários anotados em lugares diferentes (caderno, WhatsApp, Instagram)",
          "Clientes que “somem” depois de 3 semanas sem lembrete",
          "Dificuldade de encaixar manutenção urgente sem bagunçar o dia",
          "Falta de visão de quantas vagas ainda restam na semana",
        ],
      },
      {
        type: "h2",
        text: "Recursos que valem a pena na prática",
      },
      {
        type: "p",
        text: "Foque em agenda com duração por serviço, confirmação automática e lembrete de retorno. Para alongamento e gel, o intervalo costuma ser de 15 a 21 dias; esmaltação em unha natural pode variar. O software deve permitir ajustar esse prazo por cliente.",
      },
      {
        type: "h2",
        text: "Como implantar sem travar o atendimento",
      },
      {
        type: "ul",
        items: [
          "Cadastre primeiro os serviços mais comuns e as durações reais",
          "Migre a agenda da semana atual e avise as clientes do novo link",
          "Use o histórico: cor, formato e observações de unhas frágeis",
          "Na saída da cliente, já sugira a data de retorno",
        ],
      },
      {
        type: "p",
        text: "Com o fluxo digital no ar, você gasta menos tempo respondendo “tem horário amanhã?” e mais tempo no atendimento. Soluções como a VOLTTA encaixam nesse ritmo sem exigir treinamento longo.",
      },
    ],
  },
  {
    slug: "whatsapp-automatico-estetica",
    niche: "estetica",
    title: "WhatsApp automático para estética: confirmações e retornos",
    description:
      "Como usar WhatsApp automático na estética para confirmar horários, lembrar manutenção de unhas e cílios e reduzir faltas.",
    keywords: [
      "whatsapp automático estética",
      "automação whatsapp estética",
      "lembrete whatsapp manicure",
      "confirmação horário estética",
    ],
    publishedAt: "2026-06-17",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "No estúdio de estética, o WhatsApp é o canal principal — e também a maior fonte de interrupção. Automação bem feita não tira o toque humano: ela cuida das mensagens repetitivas para você focar no atendimento.",
      },
      {
        type: "h2",
        text: "O que automatizar primeiro",
      },
      {
        type: "ul",
        items: [
          "Confirmação 24 horas antes do horário",
          "Lembrete no dia do atendimento (2–3 horas antes)",
          "Convite de retorno no intervalo certo (unhas, cílios, sobrancelha)",
          "Link de reagendamento quando a cliente cancela",
        ],
      },
      {
        type: "h2",
        text: "Tom de voz que converte sem parecer robô",
      },
      {
        type: "p",
        text: "Escreva mensagens curtas, com o nome da cliente, o serviço e o horário. Evite textos longos. Um exemplo de retorno: “Oi, Ana! Sua manutenção de cílios completa cerca de 18 dias — quer reservar o próximo horário?”. Simples e direto.",
      },
      {
        type: "h2",
        text: "Cuidados para não incomodar",
      },
      {
        type: "ul",
        items: [
          "Não envie várias mensagens no mesmo dia sem necessidade",
          "Respeite horário comercial nos lembretes",
          "Permita que a cliente remarque em um clique",
          "Separe confirmação de atendimento de ofertas promocionais",
        ],
      },
      {
        type: "p",
        text: "Com confirmações e retornos no automático, a agenda fica mais estável e as manutenções voltam no prazo. A VOLTTA ajuda a conectar agenda e WhatsApp sem você virar secretária em tempo integral.",
      },
    ],
  },
  {
    slug: "agenda-online-sobrancelha",
    niche: "estetica",
    title: "Agenda online para sobrancelha: design, henna e retorno",
    description:
      "Monte uma agenda online para sobrancelha com slots certos para design, henna e brow lamination, e planeje o retorno a cada 20–30 dias.",
    keywords: [
      "agenda online sobrancelha",
      "agendamento design de sobrancelha",
      "horário sobrancelha",
      "retorno sobrancelha",
    ],
    publishedAt: "2026-06-21",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "Design de sobrancelha parece rápido, mas a agenda online precisa respeitar avaliação do formato, simetria e tempo de coloração. Sem estrutura, os encaixes viram atraso e a cliente sente pressa.",
      },
      {
        type: "h2",
        text: "Separe serviços com durações claras",
      },
      {
        type: "ul",
        items: [
          "Design simples: 30–40 minutos",
          "Design + henna: 45–60 minutos",
          "Brow lamination: 60–75 minutos",
          "Retoque rápido: 20–30 minutos (com critério)",
        ],
      },
      {
        type: "h2",
        text: "Intervalo de retorno que fideliza",
      },
      {
        type: "p",
        text: "A maioria das clientes se beneficia de retorno entre 20 e 30 dias, conforme o crescimento dos pelos e o tipo de procedimento. Na agenda online, ofereça o próximo horário ao confirmar o atendimento atual — especialmente em períodos de festa e verão.",
      },
      {
        type: "h2",
        text: "Boas práticas na página de agendamento",
      },
      {
        type: "ul",
        items: [
          "Mostre fotos de antes e depois no link de agendamento",
          "Peça referência de formato desejado no formulário",
          "Informe cuidados pós-procedimento (henna e laminação)",
          "Ative lembrete de manutenção antes do ciclo estourar",
        ],
      },
      {
        type: "p",
        text: "Com a agenda online alinhada ao ritmo da sobrancelha, você reduz mensagens soltas e mantém a carteira em manutenção contínua. Experimente centralizar isso na VOLTTA se quiser menos atrito no WhatsApp.",
      },
    ],
  },
  {
    slug: "lembrete-manutencao-cilios",
    niche: "estetica",
    title: "Lembrete de manutenção de cílios: como não perder o ciclo",
    description:
      "Estratégias de lembrete de manutenção de cílios a cada 15–20 dias para manter volume, agenda cheia e clientes fiéis.",
    keywords: [
      "lembrete manutenção cílios",
      "manutenção de cílios",
      "retorno cílios",
      "quando fazer manutenção cílios",
    ],
    publishedAt: "2026-06-25",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "A manutenção de cílios é o que sustenta o faturamento da designer. Sem lembrete no momento certo, a cliente deixa passar o ciclo, o volume cai e muitas vezes ela só volta quando precisa refazer quase tudo — o que custa mais tempo e dinheiro para as duas.",
      },
      {
        type: "h2",
        text: "Qual o intervalo ideal?",
      },
      {
        type: "p",
        text: "Em geral, a manutenção fica entre 15 e 20 dias. Clientes com ciclo de queda mais rápido podem precisar voltar perto de 12–14 dias; quem tem fios mais resistentes aguenta até 21. O lembrete deve ser personalizado, não genérico.",
      },
      {
        type: "h2",
        text: "Quando disparar o aviso",
      },
      {
        type: "ul",
        items: [
          "3 dias antes do intervalo ideal: convite amigável com link de horário",
          "No dia do vencimento: reforço curto se ainda não remarcou",
          "Após 25 dias sem retorno: mensagem de “refazer ou manutenção intensa”",
          "Nunca bombardear: no máximo 2 toques por ciclo",
        ],
      },
      {
        type: "h2",
        text: "Mensagem que gera resposta",
      },
      {
        type: "p",
        text: "Cite o benefício (“manter o volume sem refazer do zero”) e ofereça 2 ou 3 opções de horário. Inclua o tempo estimado da manutenção. Clientes respondem mais quando a decisão fica fácil.",
      },
      {
        type: "ul",
        items: [
          "Use o nome e o estilo aplicado na última visita",
          "Lembre cuidados caseiros se notar queda precoce",
          "Ofereça lista de espera se a agenda estiver cheia",
          "Registre quem prefere contato por áudio ou só texto",
        ],
      },
      {
        type: "p",
        text: "Lembretes consistentes protegem o resultado do trabalho e a previsibilidade da semana. Com a VOLTTA, você pode amarrar o intervalo de cílios à agenda sem depender da memória.",
      },
    ],
  },
  {
    slug: "intervalo-retorno-manicure",
    niche: "estetica",
    title: "Intervalo de retorno na manicure: 15, 21 ou 28 dias?",
    description:
      "Entenda o intervalo de retorno ideal na manicure por tipo de serviço (esmaltação, gel, alongamento) e como combinar isso com a cliente.",
    keywords: [
      "intervalo de retorno manicure",
      "quando voltar manicure",
      "manutenção unha gel",
      "retorno alongamento",
    ],
    publishedAt: "2026-06-29",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "Definir o intervalo de retorno na manicure evita unhas quebradas, lifting excessivo e clientes frustradas. O prazo certo depende do serviço, do crescimento da unha e da rotina da pessoa — e deve ser combinado ainda no atendimento.",
      },
      {
        type: "h2",
        text: "Referências práticas por serviço",
      },
      {
        type: "ul",
        items: [
          "Esmaltação em unha natural: 7–14 dias",
          "Esmaltação em gel: 15–21 dias",
          "Alongamento (fibra, gel, acrílico): 15–21 dias",
          "Blindagem / fortalecimento: 15–20 dias",
        ],
      },
      {
        type: "h2",
        text: "Sinais de que o intervalo precisa encurtar",
      },
      {
        type: "p",
        text: "Se a cliente trabalha com as mãos, pratica esportes ou tem crescimento rápido, 21 dias pode ser tarde. Observe descolamento, quebra nas laterais e lifting. Nesses casos, sugira retorno em 15 dias e explique o porquê — educação gera adesão.",
      },
      {
        type: "h2",
        text: "Como transformar intervalo em hábito",
      },
      {
        type: "ul",
        items: [
          "Já marque o próximo horário antes da cliente sair",
          "Envie lembrete 3 dias antes da data ideal",
          "Ofereça pacote de manutenções com desconto leve",
          "Registre o intervalo preferido no cadastro dela",
        ],
      },
      {
        type: "p",
        text: "Quando o retorno vira rotina, a manicure previsível sustenta o mês. Use a agenda para reforçar o prazo certo — e, se quiser, a VOLTTA para lembrar a cliente no momento ideal.",
      },
    ],
  },
  {
    slug: "link-agendamento-manicure",
    niche: "estetica",
    title: "Link de agendamento para manicure: como montar e divulgar",
    description:
      "Crie um link de agendamento para manicure que a cliente usa no Instagram e WhatsApp, com serviços claros e retorno facilitado.",
    keywords: [
      "link de agendamento manicure",
      "link para marcar manicure",
      "agendamento manicure Instagram",
      "bio Instagram manicure",
    ],
    publishedAt: "2026-07-03",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "O link de agendamento para manicure encurta o caminho entre o interesse e o horário marcado. Em vez de responder a cada story ou direct, você coloca o link na bio, no WhatsApp e nos cartões digitais.",
      },
      {
        type: "h2",
        text: "O que o link precisa mostrar",
      },
      {
        type: "ul",
        items: [
          "Lista de serviços com duração e preço (ou faixa de preço)",
          "Horários reais disponíveis, sem falsas vagas",
          "Política de atraso, sinal ou cancelamento, se houver",
          "Campo para observações (alergia, preferência de cor, manutenção)",
        ],
      },
      {
        type: "h2",
        text: "Onde divulgar com consistência",
      },
      {
        type: "p",
        text: "Use o mesmo link em todos os canais. Na bio do Instagram, no status do WhatsApp, na resposta automática e no rodapé dos stories. Uniformidade reduz dúvida e aumenta conversão de curiosas para clientes recorrentes.",
      },
      {
        type: "h2",
        text: "Use o link também no retorno",
      },
      {
        type: "ul",
        items: [
          "Envie o link no lembrete de manutenção (15–21 dias)",
          "Inclua no agradecimento pós-atendimento",
          "Ofereça remarcar pelo link quando houver cancelamento",
          "Peça para a cliente salvar o link nos favoritos",
        ],
      },
      {
        type: "p",
        text: "Um bom link de agendamento transforma marketing em agenda preenchida. Com a VOLTTA, você gera esse link e mantém os retornos de unha no ritmo certo sem retrabalho.",
      },
    ],
  },
  {
    slug: "manicure-autonoma-organizar-agenda",
    niche: "estetica",
    title: "Manicure autônoma: como organizar a agenda sozinha",
    description:
      "Rotina prática para manicure autônoma organizar agenda, pausas, materiais e retornos sem perder o controle do dia.",
    keywords: [
      "manicure autônoma organizar agenda",
      "manicure autônoma",
      "organizar horário manicure",
      "rotina manicure",
    ],
    publishedAt: "2026-07-07",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "Ser manicure autônoma significa ser também a recepcionista, a estoquista e a marketing. Organizar a agenda é a forma mais eficiente de proteger sua energia e o padrão do atendimento.",
      },
      {
        type: "h2",
        text: "Estruture o dia em blocos",
      },
      {
        type: "ul",
        items: [
          "Manhã: serviços mais longos (alongamento e manutenção pesada)",
          "Tarde: esmaltação e retornos rápidos",
          "Reserve 1–2 vagas semanais para encaixes de emergência",
          "Bloqueie 15 minutos a cada 3 atendimentos para limpeza e alongar as costas",
        ],
      },
      {
        type: "h2",
        text: "Regras que salvam a semana",
      },
      {
        type: "p",
        text: "Defina horário de resposta no WhatsApp (por exemplo, só entre turnos). Peça confirmação com antecedência. Não aceite “só um retoquezinho” no meio de um slot cheio — isso é o que desmonta a agenda da autônoma.",
      },
      {
        type: "h2",
        text: "Retorno como âncora financeira",
      },
      {
        type: "ul",
        items: [
          "Meta: X manutenções por semana já marcadas",
          "Combine o próximo horário na saída da cliente",
          "Use lembrete automático no intervalo de 15–21 dias",
          "Revise toda domingo: vagas vazias vs. lista de retorno pendente",
        ],
      },
      {
        type: "p",
        text: "Com rotina clara, a manicure autônoma trabalha com menos ansiedade e mais previsibilidade. Ferramentas como a VOLTTA ajudam a manter agenda e lembretes sem virar segunda jornada burocrática.",
      },
    ],
  },
  {
    slug: "designer-cilios-agenda-online",
    niche: "estetica",
    title: "Designer de cílios: agenda online que respeita o tempo real",
    description:
      "Como a designer de cílios deve configurar agenda online para aplicação, volume e manutenção sem atraso e com retorno em 15–20 dias.",
    keywords: [
      "designer de cílios agenda online",
      "agenda designer cílios",
      "agendamento extensão de cílios",
      "horário manutenção cílios",
    ],
    publishedAt: "2026-07-11",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "Para a designer de cílios, a agenda online só funciona se a duração for honesta. Volume alto e mapping detalhado não cabem no mesmo slot de uma manutenção leve — e a cliente sente quando o horário foi subestimado.",
      },
      {
        type: "h2",
        text: "Configure serviços com precisão",
      },
      {
        type: "ul",
        items: [
          "Fio a fio / clássico: 90–120 minutos",
          "Volume brasileiro / híbrido: 120–150 minutos",
          "Volume russo: 150–180 minutos",
          "Manutenção (até ~40–50% de queda): 60–90 minutos",
        ],
      },
      {
        type: "h2",
        text: "Evite o erro clássico do encaixe",
      },
      {
        type: "p",
        text: "Não ofereça manutenção no mesmo espaço de uma aplicação nova. Na agenda online, serviços diferentes devem abrir horários diferentes. Isso protege sua postura, a qualidade do mapping e o compromisso com a próxima cliente.",
      },
      {
        type: "h2",
        text: "Feche o ciclo de manutenção",
      },
      {
        type: "ul",
        items: [
          "Ao finalizar, mostre o calendário e marque 15–20 dias",
          "Envie lembrete 72 horas antes do retorno ideal",
          "Se passar de 25 dias, oriente que pode virar “quase aplicação nova”",
          "Mantenha fotos do mapping no histórico da cliente",
        ],
      },
      {
        type: "p",
        text: "Agenda online bem calibrada é o que permite crescer sem perder qualidade. A VOLTTA pode ajudar a designer a receber marcações certas e lembrar o retorno no prazo do fio.",
      },
    ],
  },
  {
    slug: "reduzir-faltas-estudio-estetica",
    niche: "estetica",
    title: "Como reduzir faltas no estúdio de estética",
    description:
      "Táticas práticas para reduzir faltas e atrasos no estúdio de estética: confirmação, política clara e lembretes de manutenção.",
    keywords: [
      "reduzir faltas estética",
      "no-show estúdio beleza",
      "faltas manicure",
      "confirmação horário estética",
    ],
    publishedAt: "2026-07-15",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "Falta no estúdio de estética dói duas vezes: você perde a receita daquele horário e ainda pode ter recusado outra cliente. Reduzir no-show é gestão, não “sorte com cliente consciente”.",
      },
      {
        type: "h2",
        text: "Confirmação em dois momentos",
      },
      {
        type: "ul",
        items: [
          "24 horas antes: peça confirmação objetiva (sim / remarcar)",
          "No dia: lembrete curto com horário e endereço ou link do Maps",
          "Se não confirmar, libere a vaga para lista de espera",
          "Registre quem atrasa com frequência e ajuste a política",
        ],
      },
      {
        type: "h2",
        text: "Política clara, sem drama",
      },
      {
        type: "p",
        text: "Comunique no ato do agendamento: tolerância de atraso (ex.: 10 minutos), regra de cancelamento e se há sinal em serviços longos (alongamento, volume de cílios). Transparência reduz atrito e filtra quem não respeita o tempo.",
      },
      {
        type: "h2",
        text: "Manutenção marcada = menos furo",
      },
      {
        type: "ul",
        items: [
          "Clientes com retorno já agendado faltam menos",
          "Lembretes no ciclo de unhas e cílios mantêm o compromisso vivo",
          "Facilite remarcar pelo mesmo link — remarcar é melhor que sumir",
          "Agradeça pontualidade; reforce hábitos positivos",
        ],
      },
      {
        type: "p",
        text: "Com confirmações e política alinhadas, as faltas caem e a agenda volta a ser previsível. A VOLTTA facilita esse fluxo de lembretes sem você perseguir cada cliente manualmente.",
      },
    ],
  },
  {
    slug: "crm-para-estetica",
    niche: "estetica",
    title: "CRM para estética: conheça a cliente além do horário",
    description:
      "Como um CRM para estética ajuda a guardar preferências, histórico de procedimentos e intervalos de retorno de unhas, cílios e sobrancelha.",
    keywords: [
      "crm para estética",
      "crm estúdio beleza",
      "cadastro clientes estética",
      "histórico cliente manicure",
    ],
    publishedAt: "2026-07-19",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "CRM para estética é, na prática, memória organizada: quem é a cliente, o que ela gosta, quando voltou pela última vez e quando deveria retornar. Sem isso, cada atendimento recomeça do zero.",
      },
      {
        type: "h2",
        text: "Dados que realmente importam",
      },
      {
        type: "ul",
        items: [
          "Preferências de cor, formato de unha e estilo de cílios",
          "Alergias, sensibilidades e produtos que funcionaram",
          "Data da última visita e intervalo ideal de manutenção",
          "Canal preferido de contato e horário em que costuma responder",
        ],
      },
      {
        type: "h2",
        text: "Do cadastro à recorrência",
      },
      {
        type: "p",
        text: "O CRM ganha valor quando alimenta o próximo contato. Se a manutenção de cílios vence em 18 dias, o sistema (ou você, com disciplina) dispara o convite. Se a unha gel pede 21 dias, o mesmo. Recorrência deixa de ser feeling e vira processo.",
      },
      {
        type: "h2",
        text: "Comece simples",
      },
      {
        type: "ul",
        items: [
          "Não tente cadastrar tudo no primeiro dia — priorize clientes fiéis",
          "Padronize campos para não virar texto solto inútil",
          "Atualize o histórico ao final de cada atendimento",
          "Use o CRM para campanhas leves (retorno, aniversário, reativação)",
        ],
      },
      {
        type: "p",
        text: "Com um CRM enxuto, o estúdio parece maior e mais profissional. A VOLTTA concentra agenda e relacionamento para você não espalhar dados em planilhas esquecidas.",
      },
    ],
  },
  {
    slug: "marketing-whatsapp-manicure",
    niche: "estetica",
    title: "Marketing no WhatsApp para manicure: sem spam, com retorno",
    description:
      "Ideias de marketing no WhatsApp para manicure: carteira quente, lembretes de manutenção e ofertas que respeitam a cliente.",
    keywords: [
      "marketing whatsapp manicure",
      "divulgar manicure whatsapp",
      "mensagem manicure clientes",
      "reativação clientes manicure",
    ],
    publishedAt: "2026-07-23",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "Marketing no WhatsApp para manicure funciona melhor quando parece cuidado, não propaganda. A cliente já te tem salva — use isso para reforçar manutenção e novidades, sem inundar a conversa.",
      },
      {
        type: "h2",
        text: "Segmentos que respondem melhor",
      },
      {
        type: "ul",
        items: [
          "Clientes com retorno vencendo em 3–5 dias",
          "Clientes inativas há 40–60 dias (reativação)",
          "Quem ama nail art: lance de tendências da estação",
          "Quem só faz esmaltação: convite para experimentar gel",
        ],
      },
      {
        type: "h2",
        text: "Frequência e formato",
      },
      {
        type: "p",
        text: "Uma mensagem de manutenção no ciclo certo vale mais do que broadcast semanal. Se for promover, limite a 1 campanha por quinzena e sempre ofereça link de horário. Foto do trabalho recente aumenta resposta.",
      },
      {
        type: "h2",
        text: "Roteiros que você pode adaptar",
      },
      {
        type: "ul",
        items: [
          "Retorno: “Sua manutenção de gel completa ~18 dias — quer encaixar?”",
          "Reativação: “Faz um tempo! Separei horários essa semana pra te atender”",
          "Novidade: “Abri agenda para nail art da temporada — link na mensagem”",
          "Lista de espera: “Abriu vaga amanhã 15h — ainda tem interesse?”",
        ],
      },
      {
        type: "p",
        text: "WhatsApp bem usado enche a agenda de retornos sem cansar a carteira. Combine mensagens certas com uma ferramenta como a VOLTTA para não perder o timing da manutenção.",
      },
    ],
  },
  {
    slug: "fidelizar-clientes-manicure",
    niche: "estetica",
    title: "Como fidelizar clientes na manicure com experiência e retorno",
    description:
      "Estratégias para fidelizar clientes na manicure: padrão de atendimento, intervalo de manutenção e comunicação no momento certo.",
    keywords: [
      "fidelizar clientes manicure",
      "clientes fiéis manicure",
      "retenção manicure",
      "manutenção recorrente unha",
    ],
    publishedAt: "2026-07-27",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "Fidelizar clientes na manicure custa menos do que conquistar novas. A fidelidade nasce da combinação de resultado consistente, pontualidade e um ciclo de retorno fácil de cumprir.",
      },
      {
        type: "h2",
        text: "Experiência que a cliente lembra",
      },
      {
        type: "ul",
        items: [
          "Ambiente limpo e tempo respeitado",
          "Lembrar preferências sem ela precisar repetir",
          "Explicar cuidados em casa para alongar a duração",
          "Entregar o visual combinado, sem surpresas ruins",
        ],
      },
      {
        type: "h2",
        text: "Retorno: o hábito da fidelidade",
      },
      {
        type: "p",
        text: "Quem volta a cada 15–21 dias raramente experimenta outra profissional no meio do caminho. Por isso, marque o próximo horário na saída e lembre perto da data. Fidelização, nesse mercado, é manutenção bem cuidada.",
      },
      {
        type: "h2",
        text: "Programas simples que funcionam",
      },
      {
        type: "ul",
        items: [
          "Pacote de 4 manutenções com pequeno benefício",
          "Prioridade de horário para clientes recorrentes",
          "Brinde ocasional (óleo de cutícula, limpeza extra)",
          "Pedido de indicação só depois de 3 visitas felizes",
        ],
      },
      {
        type: "p",
        text: "Quando a cliente sente que tem “seu lugar” na agenda, a troca fica difícil. Organize retornos com disciplina — e use a VOLTTA se quiser lembretes sem perseguir o WhatsApp manualmente.",
      },
    ],
  },
  {
    slug: "gestao-estudio-beleza",
    niche: "estetica",
    title: "Gestão de estúdio de beleza: agenda, equipe e recorrência",
    description:
      "Guia de gestão para estúdio de beleza com foco em agenda compartilhada, padrões de atendimento e manutenção de unhas e cílios.",
    keywords: [
      "gestão estúdio de beleza",
      "gerenciar estúdio estética",
      "administração salão estética",
      "organizar estúdio beleza",
    ],
    publishedAt: "2026-07-31",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "Gestão de estúdio de beleza une operação e experiência. Mesmo com poucos profissionais, é preciso alinhar agenda, tempo de serviço, estoque básico e o ritmo de retorno das clientes.",
      },
      {
        type: "h2",
        text: "Pilares da operação",
      },
      {
        type: "ul",
        items: [
          "Agenda única visível para todas as profissionais",
          "Tabela de duração e preço atualizada",
          "Checklist de abertura e fechamento da sala",
          "Meta semanal de manutenções (não só de clientes novas)",
        ],
      },
      {
        type: "h2",
        text: "Recorrência como indicador",
      },
      {
        type: "p",
        text: "Acompanhe quantas clientes de unhas e cílios voltam no intervalo recomendado. Se muitas estouram 25–30 dias, o problema pode ser lembrete fraco, preço de manutenção ou falta de vagas. Gestão boa olha o ciclo, não só o caixa do dia.",
      },
      {
        type: "h2",
        text: "Rotina semanal do gestor(a)",
      },
      {
        type: "ul",
        items: [
          "Segunda: revisar ocupação e buracos na agenda",
          "Meio da semana: disparar lembretes de retorno pendentes",
          "Sexta: conferir estoque de insumos críticos",
          "Fim de mês: ver taxa de retorno e faltas",
        ],
      },
      {
        type: "p",
        text: "Com processos leves, o estúdio escala sem perder o padrão. Centralizar agenda e lembretes na VOLTTA é um caminho para a gestão ficar no celular, não em cadernos espalhados.",
      },
    ],
  },
  {
    slug: "app-para-manicure",
    niche: "estetica",
    title: "App para manicure: o que buscar antes de escolher",
    description:
      "Critérios para escolher um app para manicure: agenda no celular, lembretes de retorno, link de agendamento e uso simples no dia a dia.",
    keywords: [
      "app para manicure",
      "aplicativo manicure",
      "app agenda manicure",
      "melhor app manicure",
    ],
    publishedAt: "2026-08-04",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "Um app para manicure precisa caber entre um atendimento e outro. Se for lento ou confuso, você volta para o caderno. Por isso, avalie usabilidade no celular antes de qualquer recurso “avançado”.",
      },
      {
        type: "h2",
        text: "Checklist de escolha",
      },
      {
        type: "ul",
        items: [
          "Criar e mover horários em poucos toques",
          "Serviços com duração diferente (esmaltação vs. alongamento)",
          "Lembrete de manutenção configurável (15–21 dias)",
          "Link de agendamento para bio e WhatsApp",
          "Confirmação automática para reduzir faltas",
        ],
      },
      {
        type: "h2",
        text: "Sinais de que o app não é para você",
      },
      {
        type: "p",
        text: "Fuja de ferramentas que exigem computador o tempo todo, cobram módulos que você não usa ou não permitem personalizar o intervalo de retorno. Manicure vive de recorrência — o app precisa entender isso.",
      },
      {
        type: "h2",
        text: "Como testar em 7 dias",
      },
      {
        type: "ul",
        items: [
          "Cadastre seus 5 serviços principais",
          "Migre a agenda da semana e use só o app",
          "Peça para 3 clientes marcarem pelo link",
          "Avalie se o lembrete de retorno ficou natural",
        ],
      },
      {
        type: "p",
        text: "Depois de uma semana real de uso, fica claro se o app alivia ou atrapalha. A VOLTTA é uma opção para quem quer agenda e WhatsApp alinhados sem curva de aprendizado pesada.",
      },
    ],
  },
  {
    slug: "automacao-retorno-estetica",
    niche: "estetica",
    title: "Automação de retorno na estética: unhas, cílios e sobrancelha",
    description:
      "Como automatizar o retorno na estética com intervalos certos para manicure, extensão de cílios e design de sobrancelha.",
    keywords: [
      "automação retorno estética",
      "retorno automático manicure",
      "lembrete retorno cílios",
      "ciclo manutenção estética",
    ],
    publishedAt: "2026-08-08",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "Automação de retorno na estética é o que transforma atendimento pontual em carteira recorrente. Em vez de lembrar “de cabeça” quem precisa voltar, você define regras por serviço e deixa o lembrete trabalhar.",
      },
      {
        type: "h2",
        text: "Intervalos sugeridos por procedimento",
      },
      {
        type: "ul",
        items: [
          "Manicure gel / alongamento: 15–21 dias",
          "Extensão de cílios: 15–20 dias",
          "Design de sobrancelha: 20–30 dias",
          "Henna / brow lamination: conforme orientação do protocolo (geralmente 3–6 semanas)",
        ],
      },
      {
        type: "h2",
        text: "Fluxo de automação que funciona",
      },
      {
        type: "p",
        text: "No fim do atendimento, registre o serviço e o intervalo. Dias antes do vencimento, envie mensagem com link de horário. Se a cliente remarcar, pause novos lembretes daquele ciclo. Se não responder, um único reforço costuma bastar.",
      },
      {
        type: "h2",
        text: "Erros comuns na automação",
      },
      {
        type: "ul",
        items: [
          "Usar o mesmo prazo para todos os serviços",
          "Enviar promoção misturada com lembrete de manutenção",
          "Não atualizar o intervalo quando a unha ou o fio muda",
          "Automatizar sem oferecer vagas reais na mensagem",
        ],
      },
      {
        type: "p",
        text: "Com regras claras, a automação respeita a cliente e protege sua receita. A VOLTTA ajuda a ligar o ciclo de retorno à agenda sem planilha paralela.",
      },
    ],
  },
  {
    slug: "profissional-estetica-agenda-whatsapp",
    niche: "estetica",
    title: "Profissional de estética: agenda e WhatsApp no mesmo fluxo",
    description:
      "Como a profissional de estética pode unir agenda e WhatsApp para confirmar horários, reduzir mensagens repetidas e garantir manutenções.",
    keywords: [
      "profissional de estética agenda whatsapp",
      "agenda whatsapp estética",
      "organizar whatsapp estética",
      "atendimento estética whatsapp",
    ],
    publishedAt: "2026-08-12",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "A profissional de estética vive no WhatsApp — mas agenda só no chat vira risco. O caminho sustentável é usar o WhatsApp como canal e a agenda como fonte da verdade dos horários.",
      },
      {
        type: "h2",
        text: "Separe conversa de marcação",
      },
      {
        type: "ul",
        items: [
          "Tire dúvidas no chat; marque horário pelo link",
          "Use resposta rápida com o link de agendamento",
          "Evite “anotar mentalmente” enquanto atende outra cliente",
          "Centralize remarcações na agenda para não haver conflito",
        ],
      },
      {
        type: "h2",
        text: "Rotina diária sugerida",
      },
      {
        type: "p",
        text: "De manhã, revise confirmações do dia. Entre atendimentos, responda só o essencial. No fim do expediente, dispare ou revise lembretes de retorno de unhas e cílios. Essa disciplina evita o WhatsApp 24 horas.",
      },
      {
        type: "h2",
        text: "Mensagens padrão que economizam tempo",
      },
      {
        type: "ul",
        items: [
          "“Para marcar, use este link: [agenda]”",
          "“Confirma seu horário amanhã às 14h?”",
          "“Sua manutenção de cílios está no prazo — quer remarcar?”",
          "“Se precisar remarcar, avise com 24h de antecedência”",
        ],
      },
      {
        type: "p",
        text: "Quando agenda e WhatsApp trabalham juntos, a profissional recupera foco e as manutenções não se perdem. A VOLTTA foi feita para esse encaixe entre conversa e horário marcado.",
      },
    ],
  },
  {
    slug: "nao-perder-manutencao-unha-cilios",
    niche: "estetica",
    title: "Como não perder manutenção de unha e cílios na agenda",
    description:
      "Método prático para não perder manutenção de unha e cílios: intervalos, lembretes, lista de retorno e vagas protegidas na agenda.",
    keywords: [
      "não perder manutenção unha cílios",
      "manutenção unha e cílios",
      "lembrar retorno manicure cílios",
      "agenda manutenção estética",
    ],
    publishedAt: "2026-08-15",
    coverImage: NICHE_COVER.estetica.image,
    coverAlt: NICHE_COVER.estetica.alt,
    ctaLabel: "Testar VOLTTA grátis",
    ctaHref: "/signup",
    sections: [
      {
        type: "p",
        text: "Perder manutenção de unha e cílios é perder o que há de mais previsível no faturamento da estética. O segredo não é “cobrar” a cliente: é tornar o retorno óbvio, fácil e no prazo certo.",
      },
      {
        type: "h2",
        text: "Três âncoras do ciclo",
      },
      {
        type: "ul",
        items: [
          "Combinar o intervalo na cadeira (unhas 15–21 dias, cílios 15–20)",
          "Já deixar o próximo horário pré-reservado ou com lembrete agendado",
          "Proteger vagas de manutenção na semana (não lotar só com serviços novos)",
        ],
      },
      {
        type: "h2",
        text: "Lista de retorno: seu radar semanal",
      },
      {
        type: "p",
        text: "Toda segunda, liste quem vence manutenção nos próximos 7 dias. Contate quem ainda não remarcou. Quem passou de 25 dias entra em reativação com mensagem diferente — o serviço pode ter mudado de “manutenção” para “quase refazer”.",
      },
      {
        type: "h2",
        text: "Hábitos que fecham o mês",
      },
      {
        type: "ul",
        items: [
          "Não encerre o atendimento sem falar do próximo ciclo",
          "Envie no máximo dois toques por vencimento",
          "Ofereça horários concretos, não só “me avisa quando puder”",
          "Meça: % de clientes que voltam no prazo vs. atrasadas",
        ],
      },
      {
        type: "p",
        text: "Com disciplina de intervalo e lembretes, unha e cílios deixam de “escapar” da agenda. Se quiser automatizar esse radar, teste a VOLTTA e mantenha a recorrência sob controle.",
      },
    ],
  },
];
