# Engineering backlog

| Prioridade | Item | Notas |
| --- | --- | --- |
| Média | Corrigir deps dos `useEffect` (scan/unfollow) | Scan dispara ao entrar em `scanning`; revisar se precisa de guard extra |
| Média | Separar tipos de estado em arquivos (`state.ts` TODO) | Melhor manutenção |
| Média | Testes unitários: `getUsersForDisplay`, retry policy scan | Parcial: `test:graph-index` |
| Média | Gate incluir `eslint` em todo `src/` | Gate = `npm ci` + `build` + `test:graph-index` |
| Baixa | `npm run validate` no repo espelhando gate | Opcional; gate no harness |
| Baixa | i18n específica rate limit X vs Instagram | Hoje mensagem menciona Instagram no toast |
| Baixa | Code-split por adapter se bundle > ~200KB | Monitorar tamanho de `dist.js` |

**Concluído recentemente:** `PlatformAdapter`, `scan-service`, `unfollow-queue`, X MVP, prefixos `iu_ig_` / `iu_x_`.

Ao concluir item, atualizar este arquivo e o capítulo técnico relacionado.
