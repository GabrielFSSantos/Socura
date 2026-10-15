# API Instagram — friendships e headers

Implementação principal: `src/utils/utils.ts`.

## Endpoints usados

| Operação | Método | URL |
| --- | --- | --- |
| Listar following | GET | `https://www.instagram.com/api/v1/friendships/{userId}/following/?count=&max_id=` |
| Listar followers | GET | `https://www.instagram.com/api/v1/friendships/{userId}/followers/?count=&max_id=` |
| Unfollow | POST | `https://www.instagram.com/web/friendships/{id}/unfollow/` |

`userId` padrão: cookie `ds_user_id`.

## Headers (GET friendships)

- `X-IG-App-ID`: `INSTAGRAM_WEB_APP_ID` (`936619743392459`)
- `X-ASBD-ID`: `INSTAGRAM_ASBD_ID` (`129477`)
- `X-Requested-With`: `XMLHttpRequest`
- `X-CSRFToken`: cookie `csrftoken` (quando presente)
- `credentials`: `same-origin`

## `fetchFriendshipsPage`

1. Monta URL com `friendshipsUrlGenerator`.
2. Em HTTP não-OK → `InstagramApiError` com status.
3. Se `data.status === 'fail'` ou mensagem sem `users` → `InstagramApiError`.

## Tipos

- `RawFriendshipUser` — payload bruto (`pk`, `pk_id`, `username`, etc.)
- `FriendshipsPage` — `users`, `next_max_id`, `has_more`
- `UserNode` — modelo de UI (`rawFriendshipUserToUserNode`)

## Por que não GraphQL público

Comentário no código: endpoints GraphQL antigos podem retornar 200 com zero edges; o app migrou para REST v1 friendships. Ver [decision-register.md](../decision-register.md) D-001.

## Índice de seguidores

`createFollowerIndex`, `addFollowerToIndex`, `isUserInFollowerIndex` indexam múltiplos IDs e username em minúsculas para matching robusto na fase following.

Detalhes de URL e paginação: [appendix_contratos_api_instagram.md](appendix_contratos_api_instagram.md).
