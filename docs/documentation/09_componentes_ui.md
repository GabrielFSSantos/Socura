# Componentes de UI

Stack: Preact com JSX, estilos SCSS em `src/styles*` e `src/styles/`.

| Componente | Arquivo | Responsabilidade |
| --- | --- | --- |
| `App` | `main.tsx` | Estado global, effects scan/unfollow, composição |
| `NotSearching` | `components/NotSearching.tsx` | Tela inicial, CTA scan, load cache |
| `Searching` | `components/Searching.tsx` | Lista, paginação, seleção, pause scan, export |
| `Unfollowing` | `components/Unfollowing.tsx` | Progresso e log de unfollow |
| `Toolbar` | `components/Toolbar.tsx` | Barra superior, voltar, unfollow, idioma, settings |
| `SettingMenu` | `components/SettingMenu.tsx` | Timings e opções |
| `WhitelistManager` | `components/WhitelistManager.tsx` | Import/export/paste/clear whitelist |
| `Toast` | `components/Toast.tsx` | Mensagens temporárias (rate limit, progresso) |
| Ícones | `components/icons/*` | Logo, settings, check/uncheck |

## Layout

```text
<main class="iu">
  <section class="overlay">
    <Toolbar />
    { NotSearching | Searching | Unfollowing }
    <Toast />
  </section>
</main>
```

## Integração i18n

Componentes usam `t(key, ...)` de `utils/i18n.ts` (PT-BR, locale único).

## Estilos

- `_variables.scss`, `_helpers.scss`, `_ux_improvements.scss`, `main.scss`
- Classe raiz `iu` no overlay full-screen sobre o site da rede social

Ao adicionar tela nova, seguir o padrão de props tipadas e evitar estado duplicado fora de `App` até refatoração de estados (backlog).
