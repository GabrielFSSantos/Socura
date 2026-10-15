# Instagram — desenvolvimento

## Sessão e E2E

- Login: `npm run auth -- --platform=instagram`
- Perfil: `e2e/.auth/ig-browser-profile`
- Cookie `sessionid` indica sessão nos testes

## Contratos API (web privada, não oficial)

**Listagens**

```http
GET /api/v1/friendships/{userId}/followers/?count=50&max_id={cursor}
GET /api/v1/friendships/{userId}/following/?count=50&max_id={cursor}
```

Headers usuais: `X-IG-App-ID`, `X-ASBD-ID`, `X-Requested-With`, cookies `sessionid`, `csrftoken`, `ds_user_id`.

Resposta: `users[]`, `next_max_id`, `has_more`, `status: "ok"`.

**Unfollow**

```http
POST /web/friendships/{targetUserId}/unfollow/
```

**Remover seguidor**

```http
POST /web/friendships/{targetUserId}/remove_follower/
```

Mesmos headers CSRF (`X-CSRFToken` + `csrftoken`). Bloqueios comuns: 400/429, `feedback_required`.

Implementação: `src/platform/instagram/instagram-adapter.ts`, helpers em `src/utils/utils.ts`.
