# Checklist pré-implementação — X.com

Status: **concluído para o MVP** (evidência nos capítulos linkados).

## Pesquisa

- [x] Mapear endpoints following/followers — REST `1.1` em [16_api_x_graphql_sessao.md](../../documentation/16_api_x_graphql_sessao.md)
- [x] Headers/cookies (`auth_token`, `ct0`, `twid`, bearer público) — mesmo capítulo + [appendix_contratos_api_x.md](../../documentation/appendix_contratos_api_x.md)
- [x] Unfollow `friendships/destroy.json` e bloqueios — implementado em `src/platform/x/x-adapter.ts`
- [x] Riscos ToS/automação — [01_visao_produto_riscos_e_privacidade.md](../../documentation/01_visao_produto_riscos_e_privacidade.md)

## Produto

- [x] Nome na UI: “Social Unfollowers” + `networkLabel` (Instagram / X)
- [x] Bundle único (GitHub Pages) com `resolveAdapter`
- [x] PT-BR no lançamento X

## Técnico

- [x] `InstagramAdapter` + regressão via `runAccountScan` / `runUnfollowQueue`
- [x] `XAdapter` em produção (sem feature flag)
- [x] Testes unitários índice — `npm run test:graph-index`
- [x] Capítulo API X — `16_api_x_*`

## Segurança e privacidade

- [x] `fetch` same-origin para APIs das redes (sem beacon do projeto)
- [x] Riscos documentados

## Pronto para merge

- [x] Gate (`npm ci`, `build`, `test:graph-index`)
- [ ] Scan + unfollow manuais em conta de teste X — **QA humano** antes de release público
- [x] decision-register D-011+
