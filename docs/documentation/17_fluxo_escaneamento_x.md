# Fluxo de escaneamento — X.com

Paridade com [05_fluxo_escaneamento.md](05_fluxo_escaneamento.md), usando `XAdapter` (`src/platform/x/x-adapter.ts`) e `runAccountScan` (`src/services/scan-service.ts`).

## Pré-requisitos

- Sessão ativa em `https://x.com/` (cookies `auth_token`, `ct0`, `twid`)
- Script colado na **console do mesmo origin** (`x.com` ou `twitter.com` redirecionado)

## Fases

1. **Seguidores (`followers/list.json`)** — paginação por `cursor` / `next_cursor_str`; usuários entram no índice dual (id + `screen_name` em minúsculas).
2. **Seguindo (`friends/list.json`)** — para cada página, contas que **não** estão no índice viram candidatas a “não seguidores”; a UI recebe lotes via `onFollowingProgress`.
3. **Conclusão** — `scanIncomplete` se followers ou following pararem antes do fim (rate limit, erro, pausa prolongada); unfollow em massa bloqueado (mesma regra D-005).

## API e contrato

Detalhes de headers, paths e riscos: [16_api_x_graphql_sessao.md](16_api_x_graphql_sessao.md) e [appendix_contratos_api_x.md](appendix_contratos_api_x.md).

## Storage

Chaves com prefixo `iu_x_*` no origin `x.com`. Ver [07_whitelist_cache_localStorage.md](07_whitelist_cache_localStorage.md).

## Unfollow

`friendships/destroy.json` via fila em `runUnfollowQueue`; parada em HTTP 403/429 ou corpo com `errors`.

## Preview local

`public/preview-x.html` ou `public/preview.html?platform=x` — dados fictícios, sem chamadas à API.
