# Arquitetura e manutenção

## Onde editar

| Comportamento | Local |
| --- | --- |
| Bootstrap, host guard, UI estado | `src/main.tsx` |
| Scan / unfollow | `src/services/scan-service.ts`, `unfollow-queue.ts` |
| Adapters Instagram / X | `src/platform/instagram/`, `src/platform/x/`, `resolve-adapter.ts` |
| GET friendships IG, export, display | `src/utils/utils.ts` |
| localStorage whitelist/cache/timings | `src/utils/whitelist-manager.ts` + `storage-keys.ts` |
| Constantes Instagram | `src/constants/constants.ts` |
| Constantes X | `src/constants/x-constants.ts` |
| Tipos de estado | `src/model/*.ts` |
| Telas | `src/components/*.tsx` |
| Traduções | `src/utils/i18n.ts` |
| Bundle / Preact alias | `webpack.config.js` |
| HTML publicado | `scripts/update-index.js` + CI |

## Dependências de runtime

- Apenas APIs do browser (`fetch`, `localStorage`, `document.cookie`)
- Sessão ativa no mesmo origin (Instagram ou X)

## Alterações arriscadas

| Mudança | Risco |
| --- | --- |
| Remover dual-index (id + username) | Falsos não-seguidores |
| Continuar scan com followers incompletos | Unfollow indevido |
| Reduzir pausas default | Rate limit / action block |
| Editar `public/index.html` manualmente | PR bloqueado pelo CI |

Registrar em [decision-register.md](../decision-register.md).

## Refatoração desejável

Ver [engineering_backlog.md](engineering_backlog.md): testes adicionais, eslint no gate.

## Documentação viva

Ao mudar contrato de API ou chave `localStorage`, atualizar o capítulo numerado correspondente e os apêndices.
