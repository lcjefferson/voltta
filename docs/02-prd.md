# 02 — PRD Completo · VOLTTA™

**Versão:** 1.0  
**Owner:** Product / CTO  
**Status:** Draft aprovado para arquitetura  
**Relacionado:** [Discovery](01-discovery.md)

---

## 1. Visão do produto

A VOLTTA™ é a plataforma de **recorrência e fidelização** para barbearias. Automatiza o relacionamento no WhatsApp para que o cliente **sempre volte**, elevando faturamento sem depender de memória humana.

**Slogan:** Seu cliente sempre de volta.  
**Missão:** Aumentar faturamento via retenção.  
**Visão:** Líder em recorrência para barbearias na América Latina.

---

## 2. Objetivos do MVP

1. Barbearia sobe em < 15 minutos (conta → serviços → WhatsApp → link).
2. Automações 1–5 operando sem intervenção diária.
3. Dashboard mostra risco, receita e retorno.
4. Cobrança Stripe com trial 7 dias e ativação via webhook.
5. Isolamento multi-tenant completo.

### Não-objetivos do MVP

- App nativo, multi-loja, planos enterprise, Meta/Z-API ativos, IA de copy.

---

## 3. Personas e permissões (RBAC)

| Perfil | Capacidades principais |
|--------|------------------------|
| **ADMIN** | Tudo: billing, settings, usuários, WhatsApp, CRM, financeiro, score |
| **BARBEIRO** | Agenda própria, clientes, finalizar atendimento, ver dashboard simplificado |
| **RECEPCIONISTA** | Agenda geral, clientes, criar/editar/cancelar, sem billing/settings críticos |

---

## 4. Jornada principal (PLG)

```
Landing → Cadastro empresa+ADMIN → Trial 7 dias ativo
→ Onboarding checklist → Stripe Checkout (pode ser no dia 0 ou fim do trial)
→ Webhook ativa/renova subscription → Uso contínuo
```

**Regra de acesso:** trial ativo OU subscription `active`/`past_due` (grace 7 dias). Após grace → `suspended` (somente billing/read-only mínimo).

---

## 5. Requisitos funcionais

### 5.1 Autenticação

- Cadastro, login, logout
- Recuperação e alteração de senha
- JWT access + Refresh Token
- RBAC por role

**AC:**
- Senha ≥ 8 chars, hash Argon2/bcrypt
- Refresh rotativo; logout invalida refresh
- Rate limit em login/forgot-password

### 5.2 Empresa (tenant)

- Campos: nome, slug, telefone, timezone, logo (S3), settings
- Slug único para link público
- `company_id` em todas entidades de negócio

**AC:**
- Impossível ler/escrever dados de outro tenant (testes de isolamento)

### 5.3 Usuários / profissionais

- Até 5 profissionais no plano MVP
- Convite / criação por ADMIN
- Associação a agenda

### 5.4 Clientes (CRM)

**Campos:** nome, telefone, whatsapp, e-mail, nascimento, observações  
**Indicadores:** total gasto, ticket médio, frequência, última visita, próximo retorno, LTV

**AC:**
- Indicadores recalculados ao finalizar atendimento / registrar receita
- Busca por nome/telefone
- Soft delete / LGPD export request (mínimo: flag + audit)

### 5.5 Serviços

- Nome, valor, duração (min), intervalo_retorno_dias (nullable)
- Exemplos seed sugeridos no onboarding

**AC:**
- Sem intervalo → automação 4 não agenda retorno

### 5.6 Agenda

**Views:** dia, semana, mês  
**Ações:** criar, editar, reagendar, cancelar, finalizar  
**Status:** PENDENTE | CONFIRMADO | CANCELADO | FINALIZADO  
**Campos:** cliente, profissional, serviço(s), valor, data/hora, observação

**AC:**
- Conflito de horário do profissional bloqueado
- Finalizar gera receita + dispara domínio `AppointmentCompleted`
- Cancelar dispara notificação opcional (config)

### 5.7 Link de agendamento público

`/agendar/{slug}`

Fluxo: escolher profissional (se >1) → serviço → horário → dados cliente → confirma → registro + WhatsApp

**AC:**
- Sem login
- Rate limit por IP/slug
- Horários baseados em disponibilidade + duração

### 5.8 WhatsApp

- Abstração `WhatsappProvider`
- Implementação **`UazapiProvider`** ([docs.uazapi.com](https://docs.uazapi.com/))
- Stubs/interfaces: `EvolutionProvider`, `MetaProvider`, `ZApiProvider`
- Conexão por empresa via QR (`/instance/init` + `/instance/connect`)
- Envio: `POST /send/text`

**AC:**
- Falha de envio → retry na fila `whatsapp-queue`
- Status de conexão visível no settings

### 5.9 Motor de automações

Modelo: **Trigger → Condition → Action**

| ID | Trigger | Condition | Action |
|----|---------|-----------|--------|
| A1 | Agendamento criado | — | Mensagem confirmação |
| A2 | 24h antes do horário | status ≠ CANCELADO | Lembrete |
| A3 | 2h antes | status ≠ CANCELADO | Lembrete |
| A4 | Atendimento finalizado | serviço com intervalo | Agendar campanha retorno (delay = intervalo) |
| A5 | Aniversário (cron diário) | tem WhatsApp | Mensagem aniversário |

Templates com `{{nome}}`, `{{data}}`, `{{hora}}`, `{{link}}`.

**AC:**
- Execuções auditáveis em `automation_executions`
- Idempotência (não enviar 2x o mesmo trigger+entity)

### 5.10 Score VOLTTA™

Algoritmo proprietário (ver §8) classificando:

| Classe | Cor |
|--------|-----|
| FIEL | verde |
| ATENÇÃO | amarelo |
| RISCO | laranja |
| PERDIDO | vermelho |

**AC:**
- Recalcular em job `analytics-queue` (diário + on appointment finalize)
- Dashboard lista top riscos com ação recomendada

### 5.11 Segmentos CRM (automáticos)

- Novos, Frequentes, Premium, Em Risco, Perdidos, Recuperados

### 5.12 Financeiro

Receitas: cliente, serviço, valor, data, forma pagamento  
Indicadores: diário/semanal/mensal/anual, ticket médio, por serviço, por profissional

### 5.13 Dashboard

- Clientes em risco / fiéis / inativos
- Receita mês / anual / prevista
- Taxa de retorno
- Valor recuperado por automações
- Agendamentos do dia
- Serviços mais vendidos

### 5.14 Billing (Stripe)

- Checkout, Billing, Customer Portal, Subscriptions, Webhooks
- Abstração `PaymentProvider` → `StripeProvider`
- Eventos: `checkout.session.completed`, `customer.subscription.*`, `invoice.paid`, `invoice.payment_failed`, `trial_will_end`
- Grace 7 dias → suspender

### 5.15 Landing

Hero: slogan + subheadline + CTA **COMEÇAR TESTE GRÁTIS**  
Seções: Hero, Benefícios, Como Funciona, Funcionalidades, Casos de Uso, Planos, FAQ, CTA Final

**Direção visual (anti-slop):** identidade própria — evitar purple-gradient genérico, cream+serif terracotta, e layout broadsheet. Brand hero-level; tipografia expressiva; atmosfera com textura/foto real de barbearia; motion sutil (2–3). Sem cards no hero.

---

## 6. Requisitos não-funcionais

| Área | Requisito |
|------|-----------|
| Segurança | JWT, refresh, RBAC, rate limit, CSRF em cookies se aplicável, headers segurança, audit logs |
| LGPD | Base legal, opt-out WhatsApp, exclusão/anonimização sob request, logs |
| Performance | p95 API < 300ms endpoints CRUD; filas para I/O externo |
| Disponibilidade | API 99.5% MVP; workers restart policy |
| Observabilidade | Logs estruturados, correlation id, métricas básicas |
| Testes | Jest unit+integration; Playwright E2E; cobertura ≥ 80% nos domínios críticos |
| Multi-tenant | Row-level por `company_id`; middleware obrigatório |

---

## 7. Regras de negócio críticas

1. Máximo 5 profissionais ativos por company no plano MVP.
2. Trial 7 dias a partir do `companies.trial_ends_at`.
3. Sem subscription válida após grace → suspender mutações de negócio.
4. Finalizar atendimento é a fonte de verdade para receita automática (pode haver receita manual).
5. Próximo retorno = última visita finalizada + max(intervalos dos serviços do atendimento).
6. Link público só funciona se company não estiver `suspended`/`canceled`.
7. Mensagens só para clientes com WhatsApp válido e `marketing_opt_in` (ou transactional permitidos: confirmação/lembrete).

---

## 8. Score VOLTTA™ — especificação MVP

### Inputs (por cliente, tenant)

- `days_since_last_visit`
- `visit_count_90d`
- `avg_ticket`
- `expected_interval_days` (média ponderada dos serviços usados)
- `lifetime_revenue`
- `no_show_rate` (se disponível)

### Score de abandono (0–100)

Pseudo:

```
overdue_ratio = days_since_last_visit / max(expected_interval_days, 1)
risk = clamp(
  40 * overdue_ratio
  + 25 * (1 - min(visit_count_90d, 6)/6)
  + 15 * (no_show_rate)
  + 10 * (days_since_last_visit > 60 ? 1 : 0)
  + 10 * (lifetime_revenue < ticket_medio_empresa ? 1 : 0)
, 0, 100)
```

### Classificação

| Classe | Critério sugerido |
|--------|-------------------|
| FIEL | risk < 25 e visit_count_90d ≥ 2 |
| ATENÇÃO | 25 ≤ risk < 50 |
| RISCO | 50 ≤ risk < 75 |
| PERDIDO | risk ≥ 75 ou days_since_last_visit > 90 |

Ação recomendada RISCO/PERDIDO: “Enviar campanha de recuperação”.

*Nota:* pesos versionados em `settings` / código (`ScoreVolttaV1`) para evolução controlada.

---

## 9. User Stories (amostra prioritária)

| ID | Story | Prioridade |
|----|-------|------------|
| US-01 | Como dono, quero me cadastrar e iniciar trial sem falar com vendedor | P0 |
| US-02 | Como dono, quero cadastrar serviços com intervalo de retorno | P0 |
| US-03 | Como cliente, quero agendar pelo link público | P0 |
| US-04 | Como sistema, quero enviar confirmação no WhatsApp ao criar agendamento | P0 |
| US-05 | Como sistema, quero lembrar 24h e 2h antes | P0 |
| US-06 | Como barbeiro, quero finalizar atendimento e disparar retorno futuro | P0 |
| US-07 | Como dono, quero ver Score e clientes em risco no dashboard | P0 |
| US-08 | Como dono, quero pagar via Stripe e manter acesso | P0 |
| US-09 | Como sistema, quero felicitar aniversariantes | P1 |
| US-10 | Como recepcionista, quero reagendar sem perder histórico | P1 |

Critérios de aceitação detalhados → [05-use-cases.md](05-use-cases.md)

---

## 10. Analytics de produto (eventos)

`company_signed_up`, `onboarding_step_completed`, `whatsapp_connected`, `appointment_created`, `appointment_completed`, `automation_sent`, `checkout_started`, `subscription_activated`, `subscription_canceled`

---

## 11. Dependências externas

- Evolution API
- Stripe
- S3-compatible storage
- SMTP/provider e-mail (recuperação de senha)
- DNS / domínio `voltta.com` (ou equivalente)

---

## 12. Critérios de “MVP pronto”

- [ ] Fluxo PLG E2E green
- [ ] 5 automações em produção staging
- [ ] Isolamento multi-tenant testado
- [ ] Webhooks Stripe cobrindo ativação/suspensão
- [ ] Dashboard com Score e receita
- [ ] Cobertura ≥ 80% nos módulos core
- [ ] Docker Compose sobe stack local
- [ ] CI verde (lint, test, build)

---

## 13. Próximo artefato

→ [03 — Arquitetura de Software](03-architecture.md)
