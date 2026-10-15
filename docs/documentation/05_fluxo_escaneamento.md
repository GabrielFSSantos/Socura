# Fluxo de escaneamento

Lógica no `useEffect` dependente de `state.status === 'scanning'` em `src/main.tsx`.

## Disparo

1. Usuário em `initial` chama `onScan` → estado `scanning` com `percentage: 0`, `isScanningActive: true`, `results: []`.
2. O effect roda `scan()` uma vez por transição para `scanning` (deps apenas `[state.status]` — ver backlog).

## Pré-condição

Cookie `ds_user_id` obrigatório. Ausência → toast de falha e `isScanningActive: false`.

## Fase 1 — Seguidores (0–50% progresso)

- `fetchList('followers', FOLLOWERS_PAGE_SAFETY_LIMIT, indexFollowersPage)`
- Cada página alimenta `followerIndex` via `addFollowerToIndex`.
- Progresso aproximado até 49% com base em `followersCount`.

**Se a lista de seguidores não completar:** scan aborta, `scanIncomplete: true`, toast `scanFailedFollowers`. Não se segue para following (evita falsos não-seguidores).

## Fase 2 — Seguindo (50–100%)

- `fetchList('following', FOLLOWING_PAGE_SAFETY_LIMIT, checkFollowingPage)`
- Para cada usuário na página: `isUserInFollowerIndex` → se não está no índice, é não-seguidor.
- Lotes são **acrescentados** a `state.results` em tempo real (streaming na UI).
- Progresso até 99% com base em `checkedCount`.

## Paginação interna (`fetchList`)

- Loop com `max_id` = `page.next_max_id`
- Continua se `has_more !== false` e há usuários na página
- Para após `pageSafetyLimit` páginas (250 por padrão)

## Ritmo (`paceRequest`)

- Respeita `scanningPausedRef`
- Jitter + `timings.timeBetweenSearchCycles`
- A cada `CHECKS_BEFORE_LONG_SLEEP` requisições, pausa longa `timeToWaitAfterFiveSearchCycles` (±5s aleatório)

## Retry (`fetchPageWithRetry`)

Até 3 retries em rate limit (429, `feedback_required`), checkpoint ou erro de rede; cooldown `RATE_LIMIT_COOLDOWN_SECONDS * retries`.

## Conclusão

- Se following completou → cache em `saveCachedScanResults`, `percentage: 100`, `scanIncomplete: false`
- Se following parou cedo mas há resultados → cache parcial, `scanIncomplete: true`, toast de scan parcial

## Pausa

`pauseScan` alterna `scanningPaused`; o loop de `paceRequest` aguarda enquanto pausado.
