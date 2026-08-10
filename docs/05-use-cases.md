# 05 — Casos de Uso · VOLTTA™

**Versão:** 1.0  
**Formato:** UC + critérios de aceitação  
**Relacionado:** [PRD](02-prd.md)

---

## UC-01 — Cadastro self-service e início de trial

**Ator:** Dono (futuro ADMIN)  
**Pré-condição:** e-mail não cadastrado  
**Fluxo:**
1. Acessa landing → CTA
2. Informa nome, e-mail, senha, nome da barbearia
3. Sistema cria `company` (slug único), user ADMIN, trial 7 dias, seed automações A1–A5, roles
4. Redireciona ao onboarding

**AC:**
- Company `status=trialing`, `trial_ends_at=now+7d`
- Slug gerado/normalizado; conflito resolve com sufixo
- E-mail de boas-vindas enfileirado (opcional MVP)

---

## UC-02 — Login / Logout / Refresh

**AC:**
- Credenciais inválidas → 401 genérico + rate limit
- Logout revoga refresh
- Access token curto (ex. 15m); refresh 7–30d

---

## UC-03 — Recuperação e alteração de senha

**AC:**
- Token one-time com expiração
- Alteração exige senha atual (logado) ou token (forgot)

---

## UC-04 — Onboarding checklist

Passos: perfil empresa → serviços → profissional → conectar WhatsApp → copiar link agenda → (opcional) Stripe

**AC:**
- Progresso persistido em `settings`
- Activation event quando WhatsApp + 1 serviço + 1 appointment

---

## UC-05 — CRUD Clientes

**AC:**
- Telefone/WhatsApp validados E.164 BR preferencial
- Listagem paginada + filtros (segmento, score, busca)
- Indicadores somente leitura (calculados)

---

## UC-06 — CRUD Serviços

**AC:**
- `return_interval_days` opcional
- Não excluir hard se houver appointments; desativar

---

## UC-07 — Criar agendamento (interno)

**Ator:** ADMIN / RECEPCIONISTA / BARBEIRO  
**Fluxo:** seleciona cliente, profissional, serviços, horário → cria `pending` ou `confirmed`  
**Pós:** emite `AppointmentCreated` → A1

**AC:**
- Sem overlap do profissional
- `ends_at` = starts + soma durações
- `total_amount` = soma preços

---

## UC-08 — Reagendar / Cancelar / Finalizar

**Reagendar:** atualiza horário; reprograma jobs A2/A3  
**Cancelar:** status canceled; cancela jobs pendentes; opcional WhatsApp  
**Finalizar:** status completed; cria revenues; atualiza métricas cliente; emite `AppointmentCompleted` → A4

**AC:**
- Finalizar só se starts_at ≤ now + tolerância configurável
- A4 agenda execução em `now + interval_days` com link de reagendamento

---

## UC-09 — Agendamento público por slug

**Ator:** Cliente final  
**Fluxo:** abre `/agendar/{slug}` → serviço → profissional → slot → dados → confirma

**AC:**
- Company suspensa → página indisponível
- Cria/atualiza customer por WhatsApp/telefone
- Dispara A1

---

## UC-10 — Automações A1–A5

| UC | Trigger | AC chave |
|----|---------|----------|
| A1 | AppointmentCreated | Mensagem com nome/data/hora; execution succeeded |
| A2 | 24h before | Job delay; skip se canceled |
| A3 | 2h before | Idem A2 |
| A4 | Completed + interval | Job futuro; mensagem com `{{link}}` |
| A5 | Cron 08:00 TZ company | Clientes com birth_date = hoje |

**AC transversal:**
- Idempotência por `idempotency_key`
- Falha → retry exponencial; dead-letter após N; notifica ADMIN

---

## UC-11 — Conectar WhatsApp (Evolution)

**AC:**
- Status connecting → connected
- Healthcheck periódico
- Desconectar invalida envios (fail soft + alerta)

---

## UC-12 — Calcular Score VOLTTA e segmentos

**Trigger:** finalize + job diário  
**AC:**
- Persist `customer_scores`
- Atualiza `customer_segments` conforme regras
- Cliente RISCO/PERDIDO aparece no dashboard

---

## UC-13 — Dashboard do dia

**AC:**
- Cards: risco, fiéis, inativos, receita mês/ano/prevista, taxa retorno, valor recuperado, agenda do dia, top serviços
- Latência aceitável via `dashboard_metrics` + queries leves

---

## UC-14 — Financeiro simplificado

**AC:**
- Lista revenues com filtros data/profissional/serviço
- Totais coerentes com dashboard
- Receita manual permitida (ADMIN)

---

## UC-15 — Checkout Stripe e webhooks

**Fluxo:** cria Checkout Session → pagamento → webhook → subscription local active → libera acesso

**AC por evento:**
- `checkout.session.completed` / `customer.subscription.created` → active
- `invoice.payment_failed` → past_due + grace_until=+7d + notificação
- Após grace sem pay → suspended
- `customer.subscription.deleted` → canceled
- `trial_will_end` → notificar

---

## UC-16 — Customer Portal Stripe

**AC:** ADMIN abre portal para cartão/faturas/cancelamento

---

## UC-17 — RBAC

**AC:** BARBEIRO não acessa billing; RECEPCIONISTA não desconecta WhatsApp; testes de autorização

---

## UC-18 — Audit e LGPD mínimo

**AC:**
- Mutations sensíveis geram audit_log
- Opt-out marketing respeitado em A4/A5 (transacionais A1–A3 permitidos)
- Endpoint request exclusão (fila manual/processo)

---

## Matriz ator × UC (MVP)

| UC | ADMIN | BARBEIRO | RECEPCIONISTA | Cliente | Sistema |
|----|:-----:|:--------:|:---------------:|:-------:|:-------:|
| 01–04 Auth/Onboard | ✓ | — | — | — | ✓ |
| 05 Clientes | ✓ | ✓ | ✓ | — | — |
| 06 Serviços | ✓ | leitura | leitura | — | — |
| 07–08 Agenda | ✓ | ✓ | ✓ | — | ✓ |
| 09 Público | — | — | — | ✓ | ✓ |
| 10–12 Auto/Score | — | — | — | — | ✓ |
| 13 Dashboard | ✓ | parcial | parcial | — | — |
| 14 Financeiro | ✓ | leitura própria | leitura | — | ✓ |
| 15–16 Billing | ✓ | — | — | — | ✓ |

---

## Próximo artefato

→ [06 — Backlog + Roadmap](06-backlog-roadmap.md)
