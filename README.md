# VOLTTA™

**Seu cliente sempre de volta.**

Plataforma SaaS de retenção de clientes para barbearias.

## Status

MVP em desenvolvimento ativo — monorepo com API NestJS + Web Next.js, Prisma/PostgreSQL, Redis, Stripe/WhatsApp (ports), Docker Compose e CI.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Web | Next.js 15, TypeScript, Tailwind, TanStack Query, RHF, Zod, Zustand |
| API | NestJS, Prisma, PostgreSQL, Redis/BullMQ (ready), Swagger |
| Integrações | Uazapi (WhatsApp), Stripe Billing |
| Infra | Docker Compose, GitHub Actions |

## Subir local

```bash
# 1) Infra
docker compose up -d postgres redis

# 2) Env
cp .env.example .env
cp .env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# 3) API
cd apps/api
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev   # http://localhost:3001  · Swagger /docs

# 4) Web (outro terminal)
cd apps/web
npm install
npm run dev         # http://localhost:3000
```

Portas padrão do Compose: Postgres `15432`, Redis `16379` (para evitar conflito com serviços locais).

## Deploy (Coolify)

Guia completo: [`docs/09-coolify-deploy.md`](docs/09-coolify-deploy.md)  
Template de envs: [`.env.coolify.example`](.env.coolify.example)

Resumo: 4 serviços (Postgres, Redis, API `apps/api`, Web `apps/web`).  
Domínio web: `https://volttaagenda.fortallabs.com.br` · API: `https://api.volttaagenda.fortallabs.com.br`.

## Fluxo PLG

Landing → Cadastro (trial 7 dias) → Onboarding → Agenda/CRM → WhatsApp → Stripe.

## Documentação de produto

Ver pasta [`docs/`](docs/) (Discovery, PRD, Arquitetura, ERD, Casos de Uso, Backlog, API, [WhatsApp Uazapi](docs/08-whatsapp-uazapi.md), [Coolify](docs/09-coolify-deploy.md)).

## WhatsApp (Uazapi)

Configure no `.env` da API:

```env
UAZAPI_BASE_URL=https://free.uazapi.com
UAZAPI_ADMIN_TOKEN=seu_admintoken
```

Depois, no app: **WhatsApp → Conectar** (QR Code). Docs oficiais: https://docs.uazapi.com/

## Princípio

> Toda funcionalidade deve responder: **“Isso ajuda o cliente a voltar mais vezes?”**
