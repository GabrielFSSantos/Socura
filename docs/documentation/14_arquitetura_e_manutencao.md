# Arquitetura e manutenção

## Onde editar

| Comportamento | Local |
| --- | --- |
| Host guard, render, scan/unfollow effects | `src/main.tsx` |
| GET friendships, índice, export, display | `src/utils/utils.ts` |
| localStorage whitelist/cache/timings | `src/utils/whitelist-manager.ts` |
| Constantes Instagram e storage keys | `src/constants/constants.ts` |
| Tipos de estado | `src/model/*.ts` |
| Telas | `src/components/*.tsx` |
| Traduções | `src/utils/i18n.ts` |
| Bundle / Preact alias | `webpack.config.js` |
| HTML publicado | `scripts/update-index.js` + CI |

## Dependências de runtime

- Apenas APIs do browser (`fetch`, `localStorage`, `document.cookie`)
- Sessão Instagram ativa no mesmo origin

## Alterações arriscadas

| Mudança | Risco |
| --- | --- |
| Remover dual-index (id + username) | Falsos não-seguidores |
| Continuar scan com followers incompletos | Unfollow indevido |
| Reduzir pausas default | Rate limit / action block |
| Editar `public/index.html` manualmente | PR bloqueado pelo CI |

Registrar em [decision-register.md](../decision-register.md).

## Refatoração desejável

Ver [engineering_backlog.md](engineering_backlog.md): separar `main.tsx`, extrair `PlatformAdapter`, testes automatizados.

## Documentação viva

Ao mudar contrato de API ou chave `localStorage`, atualizar o capítulo numerado correspondente e os apêndices.
