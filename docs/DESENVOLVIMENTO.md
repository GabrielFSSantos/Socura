# Desenvolvimento

## Comandos (o essencial)

| Comando | Quando usar |
| --- | --- |
| **`npm run dev`** | Rodar o lab local (`http://127.0.0.1:8765`) — copiar bundle para IG/X |
| **`npm test`** | Testes **sem login**: unitários + E2E preview (mock) — **gate CI** |
| **`npm run test:session`** | Testes **logados**: scan, modos, whitelist no X e Instagram reais |
| `npm run build` | Só gerar `dist/` e `public/index.html` (Pages) |
| `npm run test:verify` | Fechamento: `build` + `npm test` + `test:session` |
| `npm run auth -- --platform=x\|instagram` | Gravar sessão no perfil E2E (opcional antes de `test:session`) |

Uso interno / CI: `test:unit`, `test:e2e`, `test:graph-index`, etc. — chamados por `npm test` ou `run-gate.sh`.

## Pirâmide de testes

| Camada | Onde | Login |
| --- | --- | --- |
| Unitários | `scripts/test-*.ts` via `test:unit` | Não |
| Preview | `e2e/preview/` | Não (mocks em `preview.html`) |
| Sessão | `e2e/session/` (`session-x`, depois `session-ig`) | Sim (Chrome, perfis em `e2e/.auth/`) |

Live destrutivo (unfollow/remover 1 conta): só com `E2E_LIVE_UNFOLLOW=1` ou `E2E_LIVE_REMOVE_FOLLOWER=1` + IDs — ver `e2e/session/fixtures.test-users.json.example`.

## Gate (meta-workspace)

```bash
~/GitHub/Workspaces/socura/harness/checks/run-gate.sh
```

`npm ci` → `build` → `test:unit` → preview E2E.

## Adicionar uma rede (ex.: Facebook)

1. **`src/platform/types.ts`** — já define `SocialPlatformAdapter` (`fetchFollowingPage`, `unfollow`, `removeFollower`, `capabilities`, `storageKeyPrefix`, …).
2. **`src/platform/facebook/`** — adapter + HTTP helpers (espelhar IG/X).
3. **`src/platform/resolve-adapter.ts`** — hostname → adapter.
4. **`src/main.tsx`** — host guard e título se necessário.
5. **Preview opcional:** `public/preview-*.html` + ramo em `preview-adapter.ts`.
6. **Testes:** 1 spec em `e2e/preview/` (mock) + 1 em `e2e/session/fb-*.spec.ts` (sessão); fixture `platform` se precisar de novo valor em `fixtures.ts`.
7. **`docs/PLATAFORMAS/facebook.md`** — endpoints e sessão.

## Estrutura do código

- `src/services/scan-service.ts` — modos `non_followers` | `following_all` | `followers_manage`
- `src/services/action-queue.ts` — fila unfollow / remove follower
- `src/platform/*` — adapters
- `scripts/dev-auth/` — login E2E

## WSL / Chrome

`PW_CHANNEL=chrome` para sessão X. Debug: [PLATAFORMAS/x.md](PLATAFORMAS/x.md) e `docs/snippets/`.

Typecheck Playwright no IDE: `tsconfig.playwright.json`.
