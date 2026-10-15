# Testes e gate

## Situação atual

O repositório **não** define `npm test`. Validação principal é build + lint.

## Gate recomendado

```bash
npm ci
npm run build
```

Lint (opcional até limpeza do débito upstream):

```bash
npx eslint "src/**/*.{ts,tsx}" "scripts/**/*.js"
```

Desenvolvedores com meta-workspace Social Unfollowers podem usar o script `run-gate.sh` do harness externo (`npm ci` + `build`).

## Testes manuais — preview

1. `npm run build-dev` ou servir `public/preview.html`
2. Iniciar escaneamento → lista mock
3. Alternar idioma, settings, filtros
4. Confirmar que não há erros no console

## Testes manuais — Instagram

Usar conta de teste com poucos seguidores/seguindo:

1. Colar bundle em `www.instagram.com`
2. Scan completo → comparar contagem com expectativa
3. Whitelist um usuário → não aparece em `non_whitelisted`
4. Unfollow de 1 conta de teste → verificar no app Instagram
5. Simular pausa durante scan (botão pause)

## CI

- `build_and_deploy_pages.yaml` — build e deploy
- `protect_index_html.yaml` — impede edição manual de `public/index.html`

## Melhorias futuras

- Testes unitários para `getUsersForDisplay`, índice de seguidores, parsers
- Smoke e2e opcional com preview (`?preview=scanning`)

Itens no [engineering_backlog.md](engineering_backlog.md).
