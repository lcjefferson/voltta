# Coolify — subir o VOLTTA em 5 minutos

## O que sobe
Postgres + Redis + API + Web (arquivo `docker-compose.coolify.yml`).

## Passos

1. **DNS** (se ainda não):  
   - `volttaagenda.fortallabs.com.br` → IP do Coolify  
   - `api.volttaagenda.fortallabs.com.br` → IP do Coolify  

2. Coolify → **+ New** → **Docker Compose**  
   - Repo: `lcjefferson/voltta` · branch `main`  
   - Compose file: `docker-compose.coolify.yml`  
   - Base directory: `/`  

3. **Environment Variables** — cole o conteúdo de `.env.coolify.example` e troque:
   - `POSTGRES_PASSWORD`
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
   - (opcional) Stripe e Uazapi  

4. **Domains na UI** → deixe **vazios** (rotas + Let's Encrypt nos `labels` do compose).  
   Em **Advanced**: *Connect To Predefined Network* = ON · *Raw Compose* = **OFF**  
   (não ligue Raw Compose neste stack — o build falhou com exit 255)  
   Depois do deploy: **Servers → Proxy → Restart Proxy**.

5. **Deploy** · Auto Deploy on push = on  

## Teste
- https://volttaagenda.fortallabs.com.br  
- https://api.volttaagenda.fortallabs.com.br/health → `{"status":"ok"}`  

Roles (ADMIN / BARBEIRO / RECEPCIONISTA) são seedadas automaticamente no boot da API.

## Recuperação de senha
1. Crie conta em [Resend](https://resend.com) e pegue a API key  
2. No Coolify, adicione:
   - `RESEND_API_KEY=re_...`
   - `MAIL_FROM=VOLTTA <seu@dominio-verificado.com>` (em teste pode usar `onboarding@resend.dev`)  
3. Save → Deploy  

Sem `RESEND_API_KEY`, o link de reset só aparece nos **logs da API**.

## Painel da plataforma (`/admin`)
Lista tenants (trial, em dia, inadimplente, WhatsApp, volume).

No Coolify, adicione o e-mail da **sua** conta VOLTTA:

```env
PLATFORM_ADMIN_EMAILS=voce@seudominio.com
```

Save → Deploy → entre no app → menu **Plataforma**. Sem essa env, ninguém acessa `/admin`.

## Filas (BullMQ + Redis)
A API usa Redis (`REDIS_URL`) para:
- atrasar A2/A3/A4 com jobs duráveis
- processar envios WhatsApp das automações com retry
- fila `whatsapp-outbound` com rate-limit (~5/s global + gap ~1,2s por empresa)
- locks distribuídos nos crons (A5 e varrer vencidos)

No Coolify Compose, `REDIS_URL=redis://redis:6379` já vem configurado. Sem Redis saudável, a API sobe mas as automações atrasadas ficam só no banco até o Redis voltar (o cron tenta reenfileirar).

**Health**
- `GET /health` → liveness (`{"status":"ok"}`) — use no healthcheck do Coolify
- `GET /ready` → readiness (DB + Redis) + contagens `automations` / `whatsapp-outbound`; responde **503** se Postgres ou Redis falhar

## Confirmação de e-mail
No cadastro (e ao trocar o e-mail em Configurações), a API envia link `/verify-email?token=...`.

- Contas antigas já entram como confirmadas (migration).  
- Sem confirmação, o app **não bloqueia** — só mostra um **banner** com “Reenviar e-mail”.  
- Mesma `RESEND_API_KEY` / `MAIL_FROM`; sem a key, o link aparece nos logs da API.

## Lembrete de fim de trial
Com `RESEND_API_KEY` configurada, a API envia e-mail automático ao ADMIN:
- **3 dias** antes do fim do trial  
- **1 dia** antes do fim do trial  

Link do e-mail: `/assinatura`. Roda diariamente (~10h Brasília). Sem a key, o job só registra nos logs.

## Nota
Se você já tem um resource **Web** sozinho funcionando, pode mantê-lo **ou** trocar pelo Compose (evite dois webs no mesmo domínio).
