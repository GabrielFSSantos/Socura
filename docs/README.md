# Documentação — Social Unfollowers (Instagram)

Entrada na raiz do repositório: [README.md](../README.md).

## Pilares

| Pasta / arquivo | Papel |
| --- | --- |
| **[documentation/](documentation/README.md)** | Código, fluxos, API Instagram, UI, testes e gate |
| **[plans/](plans/README.md)** | Planos de evolução (multi-plataforma, X.com) |
| **[decision-register.md](decision-register.md)** | Decisões de implementação e fork |

## Público-alvo

| Leitor | Começar por |
| --- | --- |
| **Usuário técnico** | [documentation/00_quickstart.md](documentation/00_quickstart.md) → [12_fluxo_ponta_a_ponta.md](documentation/12_fluxo_ponta_a_ponta.md) |
| **Desenvolvedor** | [documentation/13_guia_dev_e_agente.md](documentation/13_guia_dev_e_agente.md) → [14_arquitetura_e_manutencao.md](documentation/14_arquitetura_e_manutencao.md) |
| **Agente (Cursor)** | [documentation/13_guia_dev_e_agente.md](documentation/13_guia_dev_e_agente.md) → [04_api_instagram_friendships_e_headers.md](documentation/04_api_instagram_friendships_e_headers.md) → [05_fluxo_escaneamento.md](documentation/05_fluxo_escaneamento.md) |
| **Roadmap multi-plataforma** | [plans/multi-plataforma/README.md](plans/multi-plataforma/README.md) |

**Idioma:** documentação em PT-BR; identificadores, endpoints e paths como no código (inglês).

## Manutenção

| Tipo de mudança | Onde documentar |
| --- | --- |
| Endpoints ou headers Instagram | [04_api_instagram_friendships_e_headers.md](documentation/04_api_instagram_friendships_e_headers.md), [appendix_contratos_api_instagram.md](documentation/appendix_contratos_api_instagram.md) |
| Fluxo de scan / limites de página | [05_fluxo_escaneamento.md](documentation/05_fluxo_escaneamento.md), [constants.ts](../src/constants/constants.ts) |
| Whitelist / cache | [07_whitelist_cache_localStorage.md](documentation/07_whitelist_cache_localStorage.md), [appendix_chaves_localStorage.md](documentation/appendix_chaves_localStorage.md) |
| Unfollow / rate limit | [08_fluxo_unfollow_rate_limit_action_block.md](documentation/08_fluxo_unfollow_rate_limit_action_block.md) |
| Build / deploy Pages | [02_build_webpack_deploy_github_pages.md](documentation/02_build_webpack_deploy_github_pages.md) |
| Decisão de desenho | [decision-register.md](decision-register.md) |
| Débito técnico / X.com | [engineering_backlog.md](documentation/engineering_backlog.md), [plans/multi-plataforma/](plans/multi-plataforma/README.md) |
| Testes e CI local | [15_testes_e_gate.md](documentation/15_testes_e_gate.md) |
