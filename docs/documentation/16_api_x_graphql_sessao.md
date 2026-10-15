# API X.com — sessão no navegador

Contrato para o módulo **Social Unfollowers** no X. Tudo roda em `https://x.com` (ou redirect de `twitter.com`) com cookies de sessão — **sem** enviar tokens a servidores do projeto.

## Hostnames

| Host | Uso |
| --- | --- |
| `x.com` | Canônico |
| `twitter.com` | Redirect; o adapter aceita ambos |
| `localhost` / preview | Adapter `preview` (dados fictícios) |

## Autenticação (cookies + headers)

| Item | Origem |
| --- | --- |
| `auth_token` | Cookie de sessão |
| `ct0` | Cookie CSRF; também enviado como `x-csrf-token` |
| `twid` | Cookie com id do viewer (`u%3D<numericId>` após decode) |
| `Authorization` | `Bearer <token>` — token público do cliente web (ver `x-constants.ts`) |

Headers típicos nas requisições internas:

- `x-csrf-token`: valor de `ct0`
- `x-twitter-auth-type`: `OAuth2Session`
- `x-twitter-active-user`: `yes`
- `content-type`: `application/x-www-form-urlencoded` (POST) ou `application/json` (GET com query)

## Endpoints usados no MVP (REST 1.1 interno)

Base: `https://x.com/i/api/1.1/`

| Operação | Método | Path | Notas |
| --- | --- | --- | --- |
| Viewer id | GET | `account/verify_credentials.json` | Fallback se `twid` ilegível |
| Seguidores | GET | `followers/list.json` | `user_id`, `count`, `cursor` |
| Seguindo | GET | `friends/list.json` | `user_id`, `count`, `cursor` |
| Deixar de seguir | POST | `friendships/destroy.json` | body `user_id=<id>` |

Resposta de listas: `users[]`, `next_cursor` (string `0` = fim), campos de usuário `id_str`, `screen_name`, `name`, `profile_image_url_https`, `verified`, `protected`.

## GraphQL (alternativa)

O cliente web também usa `https://x.com/i/api/graphql/<queryId>/<operationName>`. Os **queryId** mudam com deploys do X. Preferimos REST 1.1 no MVP por contrato mais estável; se o X desativar REST interno, migrar para GraphQL documentando novos ids em [appendix_contratos_api_x.md](appendix_contratos_api_x.md).

## Rate limit e bloqueio

| Sinal | Tratamento no app |
| --- | --- |
| HTTP 429 | Backoff exponencial (mesmo padrão do Instagram) |
| HTTP 403 + corpo JSON `errors` | Parar fila; toast de bloqueio |
| Lista incompleta | `scanIncomplete` + unfollow em massa desabilitado (D-005) |

## Atualização do contrato

1. Abrir DevTools → Network em `x.com` logado.
2. Filtrar `followers/list`, `friends/list`, `destroy`.
3. Comparar query params e headers com esta página.
4. Registrar mudanças em [decision-register.md](../decision-register.md).
