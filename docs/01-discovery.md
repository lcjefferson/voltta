# 01 — Discovery · VOLTTA™

**Versão:** 1.0  
**Data:** 2026-08-09  
**Fase:** Discovery (pré-PRD)

---

## 1. Problema central

A maioria das barbearias perde receita **não por falta de demanda**, mas por **falha de reativação**:

- O cliente corta, paga e some.
- Ninguém lembra de chamar de volta no intervalo ideal (ex.: 20 dias pós-corte).
- Confirmações e lembretes dependem de WhatsApp manual — falha sob escala.
- Aniversários e campanhas de recuperação quase não existem.
- Sem CRM, o barbeiro não sabe quem está em risco de abandono.

**Hipótese de valor:** se a barbearia automatizar o ciclo “atendeu → aguardou intervalo → chamou → reagendou”, a frequência média de visitas sobe e o faturamento cresce sem aumentar ticket ou tráfego pago.

---

## 2. Insight de mercado

| Insight | Implicação |
|---------|------------|
| Agenda sozinha não retém | Concorrentes de agenda competem em feature parity; VOLTTA compete em **retorno** |
| WhatsApp é o canal operacional do Brasil | Integração nativa > e-mail/SMS |
| Dono de barbearia tem pouco tempo | Self-service, onboarding < 15 min, zero call comercial |
| Ticket SaaS baixo (R$79,90) | CAC precisa ser orgânico / PLG; churn é o risco #1 |
| Até 2 profissionais no plano | Encaixa micro e pequenas barbearias (maior volume LATAM) |

---

## 3. Personas

### P1 — Dono / ADMIN (comprador)

- **Quem:** dono de barbearia 1–4 cadeiras, faturamento R$8k–40k/mês.
- **Jobs:** aumentar faturamento, reduzir “cadeiras vazias”, profissionalizar operação.
- **Dores:** esquece de cobrar retorno; equipe não segue script de WhatsApp; não enxerga quem sumiu.
- **Sucesso:** mais agendamentos recorrentes sem contratar recepcionista.

### P2 — Barbeiro

- **Jobs:** atender bem, manter agenda cheia, relacionamento com cliente.
- **Dores:** perder tempo confirmando horário; não saber quando o cliente “deveria” voltar.
- **Sucesso:** agenda preenchida com clientes conhecidos.

### P3 — Recepcionista (quando existe)

- **Jobs:** agendar, confirmar, remarcar.
- **Dores:** retrabalho no WhatsApp; agenda desatualizada.
- **Sucesso:** menos mensagens manuais, menos no-show.

### P4 — Cliente final (usuário do link público)

- **Jobs:** marcar horário rápido no celular.
- **Dores:** ligar/mandar áudio; não saber horário livre.
- **Sucesso:** marcar em < 60s e receber confirmação no WhatsApp.

---

## 4. Jobs To Be Done (JTBD)

1. Quando um cliente termina o atendimento, **quero que ele seja chamado no intervalo certo**, para não perder a recorrência.
2. Quando há agendamento, **quero confirmação e lembretes automáticos**, para reduzir falta.
3. Quando um cliente some, **quero saber o risco e ter uma campanha pronta**, para recuperar receita.
4. Quando abro a barbearia, **quero ver o dia e a saúde da base**, para decidir o que fazer agora.
5. Quando não tenho recepção, **quero um link público de agenda**, para o cliente se autoagendar.

---

## 5. Proposta de valor (única)

**Transforme clientes ocasionais em clientes recorrentes** — confirmações, lembretes, retornos, aniversários e recuperação **via WhatsApp**, com Score VOLTTA™ apontando quem está em risco.

### Diferencial vs agenda genérica

| Agenda comum | VOLTTA™ |
|--------------|---------|
| Foco em horário | Foco em **voltar** |
| Notificação opcional | Motor de regras + filas |
| Lista de clientes | CRM + segmentos + score |
| Sem métrica de retenção | Dashboard de retorno e receita recuperada |

---

## 6. Escopo do Discovery → MVP

### In (MVP)

- Multi-tenant self-service + trial 7 dias + Stripe
- Cadastro empresa, usuários (ADMIN / BARBEIRO / RECEPCIONISTA)
- Clientes, Serviços (com intervalo de retorno), Agenda (dia/semana/mês)
- Link público `voltta.com/agendar/{slug}`
- WhatsApp via Evolution API (abstração `WhatsappProvider`)
- Automações 1–5 (confirmação, D-1, H-2, retorno pós-atendimento, aniversário)
- Score VOLTTA + segmentos CRM
- Financeiro simplificado + Dashboard
- Landing + checkout self-service

### Out (pós-MVP / V2+)

- App mobile nativo
- Meta Cloud API / Z-API como providers ativos
- Multi-unidade / franquias
- Planos acima de 2 profissionais (upsell)
- Fidelidade com pontos / cashback
- Integração com maquininha / PDV
- Marketplace de campanhas
- IA generativa de copy (exceto templates fixos)

---

## 7. Métricas de sucesso (North Star)

**North Star Metric:** **Taxa de retorno em 30 dias** (% de clientes com ≥1 visita que retornam em ≤30 dias).

### Métricas produto

| Métrica | Meta MVP (90 dias pós-launch) |
|---------|--------------------------------|
| Activation (conectou WhatsApp + 1 serviço + 1 agendamento) | ≥ 40% dos trials |
| Trial → Paid | ≥ 25% |
| Mensagens automáticas entregues / semana / tenant ativo | ≥ 20 |
| Redução de no-show (auto-declarado ou medido) | −15% vs baseline |
| Churn mensal | ≤ 8% |

### Métricas negócio

| Métrica | Meta |
|---------|------|
| MRR | Crescer via PLG |
| CAC | Orgânico / conteúdo / indicação |
| LTV / CAC | ≥ 3 |

---

## 8. Riscos e mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Evolution API instável / ban WhatsApp | Alto | Abstração de provider; fila + retry; healthcheck; doc de boas práticas |
| Stripe BR + impostos / CNPJ | Médio | Checkout com dados fiscais claros; portal de billing |
| Complexidade DDD atrasa MVP | Alto | Bounded contexts claros; MVP “pragmático-enterprise” (camadas sem over-engineering) |
| Barbeiro não configura retorno | Alto | Defaults por serviço; onboarding checklist |
| LGPD / opt-out WhatsApp | Alto | Consentimento, opt-out, audit log |
| Concorrência agenda com WhatsApp | Médio | Posicionamento retenção + Score + receita recuperada |

---

## 9. Premissas e restrições

- 100% self-service; sem CS humano obrigatório no onboarding.
- Um plano único no MVP (R$ 79,90).
- Isolamento multi-tenant por `company_id` em todas as tabelas de negócio.
- Português (BR) como locale padrão.
- Timezone America/Sao_Paulo default (configurável por empresa).

---

## 10. Decisões de Discovery (Approved)

1. **Produto = retenção**; agenda é feature de suporte.
2. **WhatsApp first** via Evolution no MVP.
3. **PLG puro** (landing → trial → Stripe).
4. **Score VOLTTA** é diferencial proprietário e deve aparecer no dashboard desde o MVP.
5. **Motor Trigger → Condition → Action** desde o dia 1 (mesmo com 5 regras seed).

---

## 11. Próximo artefato

→ [02 — PRD Completo](02-prd.md)
