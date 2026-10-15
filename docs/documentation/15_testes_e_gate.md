# Testes e gate

## Gate recomendado

```bash
npm ci
npm run build
npm run test:graph-index
```

Lint (opcional até limpeza do débito upstream):

```bash
npx eslint "src/**/*.{ts,tsx}" "scripts/**/*.js"
```

Meta-workspace Social Unfollowers: `harness/checks/run-gate.sh` (`npm ci` + `build` + `test:graph-index`).

## Testes automatizados

| Script | Escopo |
| --- | --- |
| `npm run test:graph-index` | `createGraphUserIndex` / `isGraphUserInIndex` (`scripts/test-graph-index.ts`, via `tsx`) |

## Testes manuais — preview

1. `npm run build` → `public/preview.html` ou `preview-x.html`
2. Iniciar escaneamento → lista mock
3. Settings, filtros, whitelist
4. Console sem erros

## Testes manuais — Instagram

Conta de teste com poucos seguidores/seguindo:

1. Colar bundle em `www.instagram.com`
2. Scan completo
3. Whitelist → tab `non_whitelisted`
4. Unfollow de 1 conta de teste
5. Pausar scan no meio → `scanIncomplete` desabilita unfollow em massa

## Testes manuais — X

Mesmo roteiro em `x.com` (conta de teste, baixo risco). Ver [17_fluxo_escaneamento_x.md](17_fluxo_escaneamento_x.md).

## Segurança (checklist)

- Adapters usam `fetch` para APIs no mesmo site (`instagram.com` / `x.com`); avatares fallback podem usar Dicebear em preview/placeholder.
- Nenhum envio de credenciais a servidores do projeto.

## CI

- `build_and_deploy_pages.yaml` — build e deploy
- `protect_index_html.yaml` — impede edição manual do bloco do script em `public/index.html` (textos da landing podem ser editados fora do bundle)

Itens futuros: [engineering_backlog.md](engineering_backlog.md).
