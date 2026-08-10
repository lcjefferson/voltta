# Integração WhatsApp — Uazapi

Provider oficial do MVP: **[Uazapi / uazapiGO v2](https://docs.uazapi.com/)**.

## Variáveis

```env
WHATSAPP_PROVIDER=uazapi
UAZAPI_BASE_URL=https://free.uazapi.com   # ou https://{seu-subdominio}.uazapi.com
UAZAPI_ADMIN_TOKEN=seu_admintoken
```

## Fluxo na VOLTTA

1. ADMIN abre **WhatsApp** no app
2. `POST /v1/whatsapp/connection` → `POST /instance/init` (admintoken) + `POST /instance/connect` (token)
3. UI exibe QR (`qrcode` base64) e faz poll em `GET /v1/whatsapp/connection`
4. Quando `status=connected`, automações usam `POST /send/text`

## Endpoints Uazapi usados

| Ação | Endpoint | Auth |
|------|----------|------|
| Criar instância | `POST /instance/init` | `admintoken` |
| Conectar / QR | `POST /instance/connect` | `token` |
| Status | `GET /instance/status` | `token` |
| Desconectar | `POST /instance/disconnect` | `token` |
| Enviar texto | `POST /send/text` | `token` |

## Recomendação

Use **WhatsApp Business** (recomendação oficial Uazapi) para reduzir desconexões.
