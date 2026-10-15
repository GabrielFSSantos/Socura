# Testes e gate

## Gate recomendado

Pré-requisito WSL (uma vez): [`Workspaces/_shared/dev-runtime/README.md`](../../../Workspaces/_shared/dev-runtime/README.md) — `~/bin/dev-runtime-install.sh`.

```bash
npm ci
npm run build
npm run test:unit
npm run e2e:live -- --grep preview
```

Meta-workspace: `harness/checks/run-gate.sh` (mesmos passos + smoke e2e preview).

## Testes unitários (`npm run test:unit`)

| Script | Escopo |
| --- | --- |
| `test:graph-index` | Índice dual id + username |
| `test:x-list-parse` | Parser REST X + `twid` |

Fixtures em `tests/fixtures/x/`.

## Playwright (`npm run e2e:live`)

| Spec | Requisito |
| --- | --- |
| `e2e/preview-smoke.spec.ts` | Sempre (preview IG + X) |
| `e2e/x-live-scan.spec.ts` | `npm run e2e:record` antes (sessão gitignored) |

Servidor estático: `scripts/e2e-static-server.mjs` (porta 4173).

## Testes manuais — Instagram / X

Conta de teste; ver [12_fluxo_ponta_a_ponta.md](12_fluxo_ponta_a_ponta.md) e [17_fluxo_escaneamento_x.md](17_fluxo_escaneamento_x.md).

Debug X: [18_debug_x_sessao.md](18_debug_x_sessao.md).

## Screenshots README

```bash
npm run build
npm run screenshots:readme
```

## CI

- `build_and_deploy_pages.yaml` — build e deploy
- `protect_index_html.yaml` — bundle em `public/index.html`

Workflow opcional `workflow_dispatch` para screenshots (não bloqueia merge).
