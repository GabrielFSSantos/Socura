# Engineering backlog

| Prioridade | Item | Notas |
| --- | --- | --- |
| Alta | Extrair scan/unfollow de `main.tsx` para módulos (`scanService`, `unfollowQueue`) | Reduzir arquivo monolítico |
| Alta | `PlatformAdapter` (Instagram vs X) | Ver [plans/multi-plataforma](../plans/multi-plataforma/README.md) |
| Média | Corrigir deps dos `useEffect` (scan/unfollow) | Evitar reexecuções inesperadas |
| Média | Separar tipos de estado em arquivos (`state.ts` TODO) | Melhor manutenção |
| Média | Testes unitários: índice seguidores, `getUsersForDisplay`, `fetchPageWithRetry` | Sem rede |
| Média | Gate incluir `eslint` em todo `src/` | Fork upstream com centenas de violações; gate hoje = `npm ci` + `build` |
| Baixa | `npm run validate` no repo espelhando gate | Opcional; gate pode ficar só no harness |
| Baixa | PT-BR na UI ou terceiro locale | Hoje EN/ES |
| Baixa | Renomear branding repo → Social Unfollowers | Decisão de produto |

Ao concluir item, atualizar este arquivo e o capítulo técnico relacionado.
