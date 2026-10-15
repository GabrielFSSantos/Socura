# Plano — multi-plataforma (Social Unfollowers)

Objetivo: manter o fluxo no Instagram e oferecer **paridade no X.com** com bundle único e `resolveAdapter(hostname)`.

## Capítulos

| # | Arquivo | Conteúdo |
| --- | --- | --- |
| 1 | [01-visao-instagram-x-abstracoes.md](01-visao-instagram-x-abstracoes.md) | Camadas, `SocialPlatformAdapter`, host guard |
| 2 | [02-checklist-pre-implementacao-x.md](02-checklist-pre-implementacao-x.md) | Pesquisa API, riscos, critérios de pronto |
| 3 | [03-acoes-massa-x.md](03-acoes-massa-x.md) | Pós-MVP — unfollow/remove em massa (esboço) |

## Estado

**Instagram + X (MVP paridade)** — adapters em `src/platform/`, scan/unfollow em `src/services/`. Documentação X: [16_api_x_graphql_sessao.md](../../documentation/16_api_x_graphql_sessao.md), [17_fluxo_escaneamento_x.md](../../documentation/17_fluxo_escaneamento_x.md).

## Relacionado

- [engineering_backlog.md](../../documentation/engineering_backlog.md)
- [decision-register.md](../../decision-register.md) — D-011 (API X REST 1.1), D-012 (prefixos `iu_ig_` / `iu_x_`)
