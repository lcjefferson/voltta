# 04 — Modelagem de Banco + ERD · VOLTTA™

**Versão:** 1.0  
**SGBD:** PostgreSQL  
**ORM:** Prisma  
**Regra:** toda tabela de negócio com `company_id` (exceto globais de catálogo de permissões).

---

## 1. Convenções

- PK: `uuid` (`gen_random_uuid()`)
- Timestamps: `created_at`, `updated_at` (timestamptz)
- Soft delete onde fizer sentido: `deleted_at`
- Money: `numeric(12,2)` + `currency` default `BRL`
- Enums Postgres tipados
- Índices compostos `(company_id, ...)` nas queries quentes

---

## 2. ERD (Mermaid)

```mermaid
erDiagram
  companies ||--o{ users : has
  companies ||--o{ customers : has
  companies ||--o{ services : has
  companies ||--o{ appointments : has
  companies ||--o{ automation_rules : has
  companies ||--o{ whatsapp_connections : has
  companies ||--o{ subscriptions : has
  companies ||--o{ revenues : has
  companies ||--o{ settings : has
  companies ||--o{ audit_logs : has
  companies ||--o{ notifications : has
  companies ||--o{ dashboard_metrics : has

  roles ||--o{ users : assigned
  roles ||--o{ role_permissions : has
  permissions ||--o{ role_permissions : has

  customers ||--o{ appointments : books
  customers ||--o{ customer_scores : scored
  customers ||--o{ customer_segments : segmented
  customers ||--o{ revenues : generates

  users ||--o{ appointments : serves
  services ||--o{ appointment_services : included
  appointments ||--o{ appointment_services : has
  appointments ||--o{ revenues : may_create

  automation_rules ||--o{ automation_executions : runs
  customers ||--o{ automation_executions : target
  appointments ||--o{ automation_executions : related

  subscriptions ||--o{ payments : billed

  companies {
    uuid id PK
    string name
    string slug UK
    string phone
    string timezone
    string logo_url
    enum status
    timestamptz trial_ends_at
    timestamptz created_at
  }

  users {
    uuid id PK
    uuid company_id FK
    uuid role_id FK
    string name
    string email
    string password_hash
    boolean is_active
    boolean is_professional
  }

  customers {
    uuid id PK
    uuid company_id FK
    string name
    string phone
    string whatsapp
    string email
    date birth_date
    text notes
    boolean marketing_opt_in
    numeric lifetime_value
    numeric total_spent
    numeric avg_ticket
    int visit_count
    timestamptz last_visit_at
    date next_return_at
  }

  services {
    uuid id PK
    uuid company_id FK
    string name
    numeric price
    int duration_minutes
    int return_interval_days
    boolean is_active
  }

  appointments {
    uuid id PK
    uuid company_id FK
    uuid customer_id FK
    uuid professional_id FK
    enum status
    timestamptz starts_at
    timestamptz ends_at
    numeric total_amount
    text notes
  }

  appointment_services {
    uuid id PK
    uuid company_id FK
    uuid appointment_id FK
    uuid service_id FK
    numeric price
    int duration_minutes
    int return_interval_days
  }

  customer_scores {
    uuid id PK
    uuid company_id FK
    uuid customer_id FK
    enum classification
    numeric abandonment_chance
    string recommended_action
    string algorithm_version
    timestamptz calculated_at
  }

  customer_segments {
    uuid id PK
    uuid company_id FK
    uuid customer_id FK
    enum segment
    timestamptz assigned_at
  }

  automation_rules {
    uuid id PK
    uuid company_id FK
    string name
    string trigger
    jsonb conditions
    jsonb actions
    boolean is_active
  }

  automation_executions {
    uuid id PK
    uuid company_id FK
    uuid rule_id FK
    uuid customer_id FK
    uuid appointment_id FK
    enum status
    string idempotency_key UK
    jsonb payload
    timestamptz scheduled_for
    timestamptz executed_at
  }

  whatsapp_connections {
    uuid id PK
    uuid company_id FK
    string provider
    enum status
    jsonb credentials_encrypted
    timestamptz last_healthcheck_at
  }

  subscriptions {
    uuid id PK
    uuid company_id FK
    string stripe_customer_id
    string stripe_subscription_id
    enum status
    timestamptz current_period_end
    timestamptz grace_until
  }

  payments {
    uuid id PK
    uuid company_id FK
    uuid subscription_id FK
    string stripe_invoice_id
    numeric amount
    enum status
    timestamptz paid_at
  }

  revenues {
    uuid id PK
    uuid company_id FK
    uuid customer_id FK
    uuid appointment_id FK
    uuid professional_id FK
    uuid service_id FK
    numeric amount
    enum payment_method
    date revenue_date
  }

  notifications {
    uuid id PK
    uuid company_id FK
    uuid user_id FK
    string type
    string title
    jsonb body
    boolean read
  }

  dashboard_metrics {
    uuid id PK
    uuid company_id FK
    date metric_date
    jsonb metrics
  }

  audit_logs {
    uuid id PK
    uuid company_id FK
    uuid actor_user_id FK
    string action
    string entity
    uuid entity_id
    jsonb metadata
    timestamptz created_at
  }

  settings {
    uuid id PK
    uuid company_id FK
    string key
    jsonb value
  }

  roles {
    uuid id PK
    string code UK
    string name
  }

  permissions {
    uuid id PK
    string code UK
    string name
  }

  role_permissions {
    uuid role_id FK
    uuid permission_id FK
  }
```

---

## 3. Entidades e campos essenciais

### companies
`id`, `name`, `slug` (unique), `phone`, `timezone`, `logo_url`, `status` (`trialing|active|past_due|suspended|canceled`), `trial_ends_at`, `stripe_customer_id?`, timestamps

### users
`id`, `company_id`, `role_id`, `name`, `email` (unique por company), `password_hash`, `is_active`, `is_professional`, `refresh` via tabela auxiliar `refresh_tokens`

### refresh_tokens (adicional recomendada)
`id`, `user_id`, `company_id`, `token_hash`, `expires_at`, `revoked_at`, `user_agent`, `ip`

### customers
Campos PRD + `marketing_opt_in`, métricas desnormalizadas para performance de CRM/Score

### services
`return_interval_days` nullable

### appointments + appointment_services
Suporte a multi-serviço no mesmo horário; `ends_at` derivado da soma das durações

### customer_scores
Histórico ou upsert 1:1 atual — MVP: **1 score vigente por customer** (unique `company_id, customer_id`)

### customer_segments
Pode haver múltiplos segmentos; unique `(company_id, customer_id, segment)`

### automation_rules
Seed por company no onboarding (A1–A5). `conditions`/`actions` JSON schema versionado.

### automation_executions
`idempotency_key` unique global ou por company — ex.: `a2:{appointmentId}:{startsAt}`

### whatsapp_connections
Credenciais criptografadas (AES-GCM com key de env)

### subscriptions / payments
Espelho Stripe; fonte de verdade Stripe + projeção local

### revenues
Linha financeira; pode ser gerada no finalize

### dashboard_metrics
Snapshot diário JSON (CQRS read model)

### audit_logs / settings / notifications
Operação e compliance

---

## 4. Enums principais

```text
CompanyStatus: trialing | active | past_due | suspended | canceled
AppointmentStatus: pending | confirmed | canceled | completed
ScoreClass: loyal | attention | risk | lost
CustomerSegment: new | frequent | premium | risk | lost | recovered
AutomationExecutionStatus: scheduled | running | succeeded | failed | skipped
WhatsappConnectionStatus: disconnected | connecting | connected | error
SubscriptionStatus: trialing | active | past_due | canceled | unpaid
PaymentStatus: pending | paid | failed | refunded
PaymentMethod: pix | cash | card | other
RoleCode: ADMIN | BARBEIRO | RECEPCIONISTA
```

*UI pode mapear loyal→FIEL etc. em PT-BR.*

---

## 5. Índices críticos

```text
companies(slug) UNIQUE
users(company_id, email) UNIQUE
customers(company_id, whatsapp)
customers(company_id, last_visit_at)
appointments(company_id, starts_at)
appointments(company_id, professional_id, starts_at)
appointments(company_id, status, starts_at)
automation_executions(company_id, scheduled_for) WHERE status = 'scheduled'
automation_executions(idempotency_key) UNIQUE
revenues(company_id, revenue_date)
customer_scores(company_id, classification, abandonment_chance DESC)
subscriptions(stripe_subscription_id) UNIQUE
```

---

## 6. Isolamento multi-tenant

Checklist de schema:

- [x] FK `company_id` em todas tabelas de negócio
- [x] Unique constraints escopadas por company quando necessário
- [x] Sem joins cross-tenant possíveis sem filtro
- [x] Roles/permissions podem ser globais (seed); vínculo user→role ainda sob company

---

## 7. Políticas de retenção de dados

| Dado | Política MVP |
|------|----------------|
| audit_logs | 12 meses |
| automation_executions | 6 meses |
| dashboard_metrics | 24 meses |
| customers | soft delete; hard delete sob request LGPD |

---

## 8. Próximo artefato

→ [05 — Casos de Uso](05-use-cases.md)
