# Fluxo de unfollow, rate limit e action block

## Entrada no modo unfollow

A partir de `scanning`, o usuário confirma unfollow dos `selectedResults`. `Toolbar` / fluxo de UI transiciona para `status: 'unfollowing'` com `unfollowLog: []` e `percentage` inicial.

## Loop (`useEffect` em `main.tsx`)

Para cada usuário em `selectedResults` (ordem da seleção):

1. `POST` em `unfollowUserUrlGenerator(user.id)`
2. Headers: `x-csrftoken`, `x-ig-app-id`, `x-asbd-id`, `x-requested-with`, `content-type: application/x-www-form-urlencoded`
3. Parse JSON da resposta
4. `isActionBlocked` se HTTP 429/400, `status === 'fail'`, `spam`, ou mensagem com `feedback_required` / `checkpoint` / `action_blocked`
5. Atualiza `unfollowLog` e `percentage` (arredondado para chegar a 100%)
6. Se action block → toast e **break** da fila
7. Entre usuários: sleep aleatório baseado em `timeBetweenUnfollows`
8. A cada 5 unfollows: pausa `timeToWaitAfterFiveUnfollows`

Preview local: effect retorna sem chamar API.

## Guard de scan incompleto

A UI deve impedir iniciar unfollow quando `scanIncomplete` está true (ver `Searching` / `Toolbar` — manter consistência ao alterar).

## Scan vs unfollow — rate limit

| Fase | Mecanismo |
| --- | --- |
| Scan | `fetchPageWithRetry`, `paceRequest`, limites de página |
| Unfollow | Pausas configuráveis + detecção de block na resposta POST |

## Cookies obrigatórios

Unfollow exige `csrftoken`. Scan de listas usa `ds_user_id` e beneficia de `csrftoken` nos GETs.
