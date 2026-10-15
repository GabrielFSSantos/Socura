# Guia para desenvolvedor e agente

## Leitura mínima antes de mudar código

1. [00_quickstart.md](00_quickstart.md)
2. [03_entrypoint_estados_e_preview_local.md](03_entrypoint_estados_e_preview_local.md)
3. [04_api_instagram_friendships_e_headers.md](04_api_instagram_friendships_e_headers.md)
4. [05_fluxo_escaneamento.md](05_fluxo_escaneamento.md)
5. [14_arquitetura_e_manutencao.md](14_arquitetura_e_manutencao.md)

## Por tipo de tarefa

| Tarefa | Ler primeiro |
| --- | --- |
| Novo endpoint ou header Instagram | [04](04_api_instagram_friendships_e_headers.md), [appendix_contratos_api_instagram.md](appendix_contratos_api_instagram.md) |
| Bug em lista / falsos não-seguidores | [05](05_fluxo_escaneamento.md) |
| Whitelist / cache | [07](07_whitelist_cache_localStorage.md) |
| UI / tradução | [09](09_componentes_ui.md), [10](10_i18n.md) |
| Unfollow / ban | [08](08_fluxo_unfollow_rate_limit_action_block.md) |
| Build / CI | [02](02_build_webpack_deploy_github_pages.md) |
| X.com / multi-plataforma | [plans/multi-plataforma/README.md](../plans/multi-plataforma/README.md) |

## Comandos locais

```bash
npm install
npm run build
npm run build-dev
```

## Gate

Quem desenvolve com meta-workspace Cursor usa o script de gate documentado em [15_testes_e_gate.md](15_testes_e_gate.md) (`npm ci`, `npm run build`, eslint).

## Convenções

- Código e identificadores em inglês.
- Documentação em português (BR) em `docs/`.
- Não referenciar caminhos de harness externo dentro de `src/` ou docs de produto voltados ao usuário final do fork público.

## Decisões e débitos

- [decision-register.md](../decision-register.md)
- [engineering_backlog.md](engineering_backlog.md)
