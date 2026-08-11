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

4. **Domains na UI** → deixe **vazios** (as rotas Traefik já estão nos `labels` do `docker-compose.coolify.yml`).  
   Em **Advanced**: *Connect To Predefined Network* = ON · *Raw Compose* = OFF  

5. **Deploy** · Auto Deploy on push = on  

## Teste
- https://volttaagenda.fortallabs.com.br  
- https://api.volttaagenda.fortallabs.com.br/health → `{"status":"ok"}`  

## Nota
Se você já tem um resource **Web** sozinho funcionando, pode mantê-lo **ou** trocar pelo Compose (evite dois webs no mesmo domínio).
