# Documentação técnica — Social Unfollowers

Referência para **build**, **UI Preact**, **API Instagram**, **scan**, **whitelist** e **unfollow**. Decisões: [decision-register.md](../decision-register.md).

## Ordem sugerida

| # | Arquivo | Conteúdo |
| --- | --- | --- |
| 0 | [00_quickstart.md](00_quickstart.md) | Instalar, build, preview, uso na console |
| 1 | [01_visao_produto_riscos_e_privacidade.md](01_visao_produto_riscos_e_privacidade.md) | Produto, ToS, anti-ban, privacidade |
| 2 | [02_build_webpack_deploy_github_pages.md](02_build_webpack_deploy_github_pages.md) | Webpack, `dist.js`, GitHub Actions |
| 3 | [03_entrypoint_estados_e_preview_local.md](03_entrypoint_estados_e_preview_local.md) | `main.tsx`, estados, preview |
| 4 | [04_api_instagram_friendships_e_headers.md](04_api_instagram_friendships_e_headers.md) | `fetchFriendshipsPage`, cookies, headers |
| 5 | [05_fluxo_escaneamento.md](05_fluxo_escaneamento.md) | Fases followers/following, índice, streaming UI |
| 6 | [06_filtros_tabs_paginacao.md](06_filtros_tabs_paginacao.md) | Tabs, filtros, paginação 50/página |
| 7 | [07_whitelist_cache_localStorage.md](07_whitelist_cache_localStorage.md) | Whitelist, timings, cache de scan |
| 8 | [08_fluxo_unfollow_rate_limit_action_block.md](08_fluxo_unfollow_rate_limit_action_block.md) | Fila POST unfollow, bloqueios |
| 9 | [09_componentes_ui.md](09_componentes_ui.md) | Componentes React/Preact |
| 10 | [10_i18n.md](10_i18n.md) | Textos da UI (PT-BR) |
| 11 | [11_modelos_e_tipos.md](11_modelos_e_tipos.md) | `State`, `UserNode`, filtros |
| 12 | [12_fluxo_ponta_a_ponta.md](12_fluxo_ponta_a_ponta.md) | Timeline do usuário |
| 13 | [13_guia_dev_e_agente.md](13_guia_dev_e_agente.md) | Roteiro dev/agente |
| 14 | [14_arquitetura_e_manutencao.md](14_arquitetura_e_manutencao.md) | Onde editar cada comportamento |
| 15 | [15_testes_e_gate.md](15_testes_e_gate.md) | Gate, testes manuais |
| — | [appendix_chaves_localStorage.md](appendix_chaves_localStorage.md) | Chaves `iu_*` |
| — | [appendix_contratos_api_instagram.md](appendix_contratos_api_instagram.md) | URLs e respostas |
| — | [engineering_backlog.md](engineering_backlog.md) | Débitos e roadmap técnico |

Índice geral: [docs/README.md](../README.md).
