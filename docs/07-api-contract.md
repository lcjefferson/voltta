# 07 — Contrato de API (OpenAPI Outline) · VOLTTA™

**Versão:** v1  
**Base path:** `/v1`  
**Auth:** `Authorization: Bearer <accessToken>` (exceto auth e booking público)  
**Padrões:** paginação cursor/limit, filtros query, erros RFC7807-like, `X-Request-Id`

---

## 1. Convenções

### Paginação
`GET ...?page=1&limit=20` → `{ data, meta: { page, limit, total, totalPages } }`

### Erros
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [{ "field": "email", "issue": "Invalid email" }],
  "requestId": "..."
}
```

### Tenant
Resolvido pelo JWT. Headers do client **não** definem `companyId`.

### Versionamento
Prefixo `/v1`. Breaking changes → `/v2`.

### Rate limiting (sugestão)
- Auth: 10/min/IP
- Público booking: 30/min/IP/slug
- API autenticada: 120/min/user

---

## 2. Auth

| Method | Path | Descrição |
|--------|------|-----------|
| POST | `/v1/auth/signup` | Cria company + ADMIN + trial |
| POST | `/v1/auth/login` | Tokens |
| POST | `/v1/auth/refresh` | Rotate |
| POST | `/v1/auth/logout` | Revoga refresh |
| POST | `/v1/auth/forgot-password` | Envia e-mail |
| POST | `/v1/auth/reset-password` | Consome token |
| POST | `/v1/auth/change-password` | Logado |

### Signup body
```json
{
  "name": "Jefferson",
  "email": "dono@barbearia.com",
  "password": "********",
  "companyName": "Barbearia Norte"
}
```

---

## 3. Company / Settings

| Method | Path | Roles |
|--------|------|-------|
| GET | `/v1/company` | all |
| PATCH | `/v1/company` | ADMIN |
| GET | `/v1/company/onboarding` | ADMIN |
| PATCH | `/v1/company/onboarding` | ADMIN |
| GET | `/v1/settings` | ADMIN |
| PUT | `/v1/settings/{key}` | ADMIN |

---

## 4. Users / Professionals

| Method | Path | Roles |
|--------|------|-------|
| GET | `/v1/users` | ADMIN |
| POST | `/v1/users` | ADMIN (enforce ≤2 professionals) |
| PATCH | `/v1/users/{id}` | ADMIN |
| POST | `/v1/users/{id}/deactivate` | ADMIN |

---

## 5. Customers

| Method | Path | Roles |
|--------|------|-------|
| GET | `/v1/customers` | all staff |
| POST | `/v1/customers` | all staff |
| GET | `/v1/customers/{id}` | all staff |
| PATCH | `/v1/customers/{id}` | all staff |
| GET | `/v1/customers/{id}/score` | all staff |
| GET | `/v1/customers/segments/{segment}` | all staff |

**Filtros:** `q`, `segment`, `score`, `page`, `limit`

---

## 6. Services

| Method | Path | Roles |
|--------|------|-------|
| GET | `/v1/services` | all staff |
| POST | `/v1/services` | ADMIN |
| PATCH | `/v1/services/{id}` | ADMIN |
| POST | `/v1/services/{id}/deactivate` | ADMIN |

### Service DTO
```json
{
  "name": "Corte Masculino",
  "price": 40.0,
  "durationMinutes": 45,
  "returnIntervalDays": 20
}
```

---

## 7. Appointments

| Method | Path | Roles |
|--------|------|-------|
| GET | `/v1/appointments` | staff (BARBEIRO: own by default) |
| POST | `/v1/appointments` | staff |
| GET | `/v1/appointments/{id}` | staff |
| PATCH | `/v1/appointments/{id}` | staff |
| POST | `/v1/appointments/{id}/reschedule` | staff |
| POST | `/v1/appointments/{id}/cancel` | staff |
| POST | `/v1/appointments/{id}/complete` | staff |

**Query views:** `from`, `to`, `professionalId`, `status`, `view=day|week|month`

### Create DTO
```json
{
  "customerId": "uuid",
  "professionalId": "uuid",
  "serviceIds": ["uuid"],
  "startsAt": "2026-08-12T15:00:00-03:00",
  "notes": "..."
}
```

---

## 8. Public Booking

| Method | Path | Auth |
|--------|------|------|
| GET | `/v1/public/{slug}` | none |
| GET | `/v1/public/{slug}/services` | none |
| GET | `/v1/public/{slug}/professionals` | none |
| GET | `/v1/public/{slug}/availability` | none |
| POST | `/v1/public/{slug}/appointments` | none |

### Availability query
`professionalId`, `serviceId(s)`, `date`

### Public create
```json
{
  "professionalId": "uuid",
  "serviceIds": ["uuid"],
  "startsAt": "ISO-8601",
  "customer": {
    "name": "João",
    "whatsapp": "+5511999999999",
    "email": "a@b.com"
  }
}
```

---

## 9. WhatsApp

| Method | Path | Roles |
|--------|------|-------|
| GET | `/v1/whatsapp/connection` | ADMIN |
| POST | `/v1/whatsapp/connection` | ADMIN |
| POST | `/v1/whatsapp/connection/disconnect` | ADMIN |
| GET | `/v1/whatsapp/connection/qr` | ADMIN |
| POST | `/v1/whatsapp/test-message` | ADMIN |

---

## 10. Automations

| Method | Path | Roles |
|--------|------|-------|
| GET | `/v1/automations/rules` | ADMIN |
| PATCH | `/v1/automations/rules/{id}` | ADMIN (enable/templates) |
| GET | `/v1/automations/executions` | ADMIN |

---

## 11. Score & CRM

| Method | Path | Roles |
|--------|------|-------|
| GET | `/v1/scores/at-risk` | staff |
| POST | `/v1/scores/recalculate` | ADMIN |
| GET | `/v1/crm/segments` | staff |

---

## 12. Finance

| Method | Path | Roles |
|--------|------|-------|
| GET | `/v1/revenues` | ADMIN / leitura restrita |
| POST | `/v1/revenues` | ADMIN |
| GET | `/v1/revenues/summary` | ADMIN |

---

## 13. Dashboard

| Method | Path | Roles |
|--------|------|-------|
| GET | `/v1/dashboard` | staff (shape por role) |

### Response shape (exemplo)
```json
{
  "customersAtRisk": 12,
  "loyalCustomers": 40,
  "inactiveCustomers": 18,
  "monthRevenue": 15230.5,
  "yearRevenue": 98000.0,
  "forecastRevenue": 16800.0,
  "returnRate": 0.62,
  "automationRecoveredRevenue": 3200.0,
  "todayAppointments": [],
  "topServices": []
}
```

---

## 14. Billing

| Method | Path | Roles |
|--------|------|-------|
| POST | `/v1/billing/checkout-session` | ADMIN |
| POST | `/v1/billing/portal-session` | ADMIN |
| GET | `/v1/billing/subscription` | ADMIN |
| POST | `/v1/billing/webhooks/stripe` | Stripe signature |

---

## 15. Notifications & Audit

| Method | Path | Roles |
|--------|------|-------|
| GET | `/v1/notifications` | self |
| POST | `/v1/notifications/{id}/read` | self |
| GET | `/v1/audit-logs` | ADMIN |

---

## 16. Health

| Method | Path |
|--------|------|
| GET | `/health` |
| GET | `/ready` |

---

## 17. OpenAPI delivery

No backend:
- `@nestjs/swagger` gera `/docs`
- Artefato exportado `docs/openapi.json` no CI

---

## 18. Gate para código

Com Discovery → PRD → Arquitetura → ERD → UCs → Backlog → **API Contract** documentados, o próximo passo é:

**Implementação do MVP** na ordem: Backend foundation → Frontend shell → módulos de domínio → WhatsApp → Stripe → Automações → Dashboard → Testes → Docker → CI/CD → Deploy.

Aguardando aceite para iniciar a fase **09 — Backend**.
