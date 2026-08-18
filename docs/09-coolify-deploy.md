# Deploy no Coolify — VOLTTA

Guia para subir **API**, **Web**, **PostgreSQL** e **Redis** no Coolify.

## Domínios oficiais

| Serviço | Domínio |
|---------|---------|
| **Web (principal)** | `https://volttaagenda.fortallabs.com.br` |
| **API** | `https://api.volttaagenda.fortallabs.com.br` |

Ambos com **HTTPS** (Let's Encrypt no Coolify).  
DNS: aponte os dois hosts para o IP/servidor do Coolify (A/CNAME).

---

## Opção A — Docker Compose (tudo junto) ✅ recomendado

Um único resource sobe **Postgres + Redis + API + Web**.

Arquivo: [`docker-compose.coolify.yml`](../docker-compose.coolify.yml)

### No Coolify

1. **+ New** → **Docker Compose** (não Application)
2. Repo `lcjefferson/voltta`, branch `main`
3. **Base Directory:** `/` (raiz)
4. **Docker Compose Location:** `docker-compose.coolify.yml`
5. Cole as envs de [`.env.coolify.example`](../.env.coolify.example) em **Environment Variables** (troque senhas/secrets)
6. Em **Domains** / serviços:
   - serviço `web` → `volttaagenda.fortallabs.com.br`
   - serviço `api` → `api.volttaagenda.fortallabs.com.br`
7. Deploy

O `DATABASE_URL` e `REDIS_URL` já apontam para os serviços internos `postgres` e `redis` no compose — não precisa criar banco separado.

### O que um Dockerfile sozinho NÃO faz

Um **Dockerfile** só constrói **uma** imagem (web **ou** api).  
Postgres/Redis/API/Web juntos exigem **Compose** (ou vários resources).

---

## Opção B — Apps separados (4 resources)

| Serviço | Tipo | Base Directory | Dockerfile | Porta | Healthcheck |
|---------|------|----------------|------------|-------|-------------|
| `voltta-postgres` | Database → PostgreSQL 16 | — | — | 5432 | — |
| `voltta-redis` | Database → Redis 7 | — | — | 6379 | — |
| `voltta-api` | Application (Dockerfile) | `apps/api` | `Dockerfile` | **3001** | `GET /health` |
| `voltta-web` | Application (Dockerfile) | `apps/web` | `Dockerfile` | **3000** | `GET /` |

## Ordem de deploy (Opção B)

1. Suba **Postgres** e **Redis** e anote as connection strings internas.
2. Configure e faça deploy da **API** com domínio `api.volttaagenda.fortallabs.com.br`.
3. Configure e faça deploy do **Web** com domínio `volttaagenda.fortallabs.com.br`.
4. No Stripe, aponte o webhook para a API.
5. No app, conecte o WhatsApp (o webhook usa `WEBHOOK_PUBLIC_URL`).

## Configuração da API (Opção B)

**Build Pack:** Dockerfile  
**Base Directory:** `apps/api`  
**Port:** `3001`  
**Domain:** `api.volttaagenda.fortallabs.com.br`

### Environment Variables (API)

Use o template em [`.env.coolify.example`](../.env.coolify.example). Mínimo:

```env
NODE_ENV=production
API_PORT=3001
PORT=3001
API_URL=https://api.volttaagenda.fortallabs.com.br
WEBHOOK_PUBLIC_URL=https://api.volttaagenda.fortallabs.com.br
WEB_URL=https://volttaagenda.fortallabs.com.br
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
ENCRYPTION_KEY=...   # 32 caracteres hex
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_ID=...
UAZAPI_BASE_URL=https://free.uazapi.com
UAZAPI_ADMIN_TOKEN=...
PLATFORM_ADMIN_EMAILS=voce@seudominio.com
```

`DATABASE_URL` / `REDIS_URL`: no Coolify, use o hostname interno do serviço (ex.: `postgres`, `redis`) na mesma rede Docker.

O entrypoint executa:

```sh
npx prisma migrate deploy
node dist/main.js
```

## Configuração do Web

**Build Pack:** Dockerfile  
**Base Directory:** `apps/web`  
**Port:** `3000`  
**Domain:** `volttaagenda.fortallabs.com.br`

### Build Arguments (obrigatórios)

No Coolify → Build → Arguments:

```text
NEXT_PUBLIC_API_URL=https://api.volttaagenda.fortallabs.com.br/v1
NEXT_PUBLIC_SITE_URL=https://volttaagenda.fortallabs.com.br
```

Também defina as mesmas como **Environment Variables** (runtime).  
`NEXT_PUBLIC_*` é embutido no build — se mudar a URL da API, **rebuild** o Web.

### Environment Variables (Web)

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_PUBLIC_API_URL=https://api.volttaagenda.fortallabs.com.br/v1
NEXT_PUBLIC_SITE_URL=https://volttaagenda.fortallabs.com.br
```

## CORS

```env
WEB_URL=https://volttaagenda.fortallabs.com.br
```

## Webhooks

| Serviço | URL |
|---------|-----|
| Stripe | `https://api.volttaagenda.fortallabs.com.br/v1/billing/webhooks/stripe` |
| Uazapi | Registrado automaticamente via `WEBHOOK_PUBLIC_URL` |

Eventos Stripe sugeridos: `checkout.session.completed`, `customer.subscription.*`, `invoice.paid`, `invoice.payment_failed`.

## Healthchecks no Coolify

- API: path `/health`, port `3001`
- Web: path `/`, port `3000`

## Checklist pós-deploy

- [ ] `https://api.volttaagenda.fortallabs.com.br/health` → `{ "status": "ok" }`
- [ ] `https://api.volttaagenda.fortallabs.com.br/docs` → Swagger
- [ ] Landing em `https://volttaagenda.fortallabs.com.br`
- [ ] Signup → login → dashboard
- [ ] Link público `/agendar/{slug}` abre
- [ ] Stripe checkout (modo test ou live)
- [ ] WhatsApp → Conectar → QR → webhook recebendo
- [ ] `robots.txt` / `sitemap.xml` na web

## Problemas comuns

| Sintoma | Causa provável |
|---------|----------------|
| Web build falha em imports | `package.json` do web sem deps — já corrigido; faça push e rebuild |
| API sobe mas DB erro | `DATABASE_URL` errada ou Postgres ainda iniciando (aumente start period) |
| WhatsApp sem leads | `WEBHOOK_PUBLIC_URL` ainda em localhost / sem HTTPS |
| Frontend chama localhost | Build do web sem `NEXT_PUBLIC_API_URL` de produção |
| CORS bloqueado | `WEB_URL` diferente de `https://volttaagenda.fortallabs.com.br` |
| Stripe portal/checkout falha | `STRIPE_*` incompleto ou webhook secret placeholder |

## Rede Coolify

Garanta que API, Web, Postgres e Redis estejam no **mesmo destination / network** para a API resolver o hostname interno do banco.
