# X.com — desenvolvimento

## Sessão e E2E

- Login: `npm run auth -- --platform=x`
- Perfil Playwright: `e2e/.auth/x-browser-profile`
- Headers espelhados: chave `iu_x_api_header_mirror` no `localStorage` — ver `src/platform/x/x-http.ts`
- Warm: `scripts/dev-auth/warm-session.mjs` (grava `e2e/.auth/x-api-headers.json` opcional)

## Contratos API (REST 1.1 interno)

| Ação | Método e path |
| --- | --- |
| Seguidores | `GET /i/api/1.1/followers/list.json?user_id={viewerId}&count={n}&cursor={cursor}` |
| Seguindo | `GET /i/api/1.1/friends/list.json?user_id={viewerId}&count={n}&cursor={cursor}` |
| Unfollow | `POST /i/api/1.1/friendships/destroy.json` — body `user_id={targetUserId}` |
| Remover seguidor | `POST /i/api/1.1/friendships/remove_follower.json` — body `user_id={targetUserId}` |

Headers: CSRF `ct0`, bearer, `x-client-transaction-id` quando disponível (`buildXApiHeaders` em `x-http.ts`).

Mapeamento para `UserNode`: `id_str` → `id`, `screen_name` → `username`, `name` → `full_name`, `profile_image_url_https` → `profile_pic_url`, `protected` → `is_private`, `verified` → `is_verified`.

GraphQL (fallback de listagem): queryIds em `localStorage` (`iu_x_graphql_followers_query_id`, `iu_x_graphql_following_query_id`) — ver `src/constants/x-constants.ts`.

## Debug

**Sessão inválida ao colar o script:** `auth_token` é HttpOnly; use bundle atual e F5 antes de colar.

**401 em listas:** recarregue x.com; confirme login; o app espera mirror de headers (`installXApiHeaderCapture`). Snippet de diagnóstico: [`docs/snippets/x-session-diagnose-snippet.js`](../snippets/x-session-diagnose-snippet.js). Captura manual de headers: [`docs/snippets/x-capture-headers-snippet.js`](../snippets/x-capture-headers-snippet.js).

**Checkpoint “Confirm your account”:** use **Usar senha**; para E2E use `npm run auth -- --platform=x` com `PW_CHANNEL=chrome` (WSL).

**Probe automatizado:** `npm run test:session` — spec `e2e/session/x-scan-probe.spec.ts` (REST `followers/list` deve retornar 200; `verify_credentials` pode ser 404).

Implementação: `src/platform/x/x-adapter.ts`.
