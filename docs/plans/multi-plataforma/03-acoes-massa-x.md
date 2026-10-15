# Fase 5 (pós-MVP) — Ações em massa

**Não implementado.** Documento de direção antes de PRs dedicados.

## Modos propostos

| Modo | Ação | Notas |
| --- | --- | --- |
| Unfollow all following | Fila com todos os `friends` sem diff de não-seguidores | Confirmação forte, whitelist obrigatória, cap diário configurável |
| Remove all followers | Endpoint distinto de unfollow (remover seguidor) | Nova fila na UI; risco alto de rate limit no X |

## Requisitos comuns

- Scan completo ou modo explícito “aceito o risco”
- Timings conservadores; parar em `actionBlocked`
- Textos de aviso ToS em [01_visao_produto_riscos_e_privacidade.md](../../documentation/01_visao_produto_riscos_e_privacidade.md)

## Implementação futura

- Extender `SocialPlatformAdapter` com `removeFollower?` ou adapter-specific queue type
- Não reutilizar a lista de não-seguidores como proxy para “todos que sigo”
