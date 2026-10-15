# Entrypoint, estados e preview local

## Bootstrap (`main.tsx` final)

```text
if hostname !== www.instagram.com && !isLocalPreview → alert e aborta
else → document.body.innerHTML = "" → render(<App />, document.body)
```

`isLocalPreview` usa `LOCAL_PREVIEW_HOSTS`: `localhost`, `127.0.0.1`, `::1`.

## Componente `App`

Orquestra:

- `state: State` — máquina de estados da UI
- `timings` — persistidos via `saveTimings` / `loadTimings`
- `cachedScan` — último scan completo em cache
- `lang` — EN ou ES
- `scanningPaused` + `scanningPausedRef` — pausa cooperativa durante scan

## Estados (`model/state.ts`)

| `status` | Significado |
| --- | --- |
| `initial` | Tela inicial (Iniciar escaneamento / Carregar cache) |
| `scanning` | Lista, filtros, seleção, scan em andamento ou concluído |
| `unfollowing` | Fila de unfollow com log de progresso |

Campos relevantes em `scanning`: `results`, `whitelistedResults`, `selectedResults`, `percentage`, `isScanningActive`, `scanIncomplete`, `currentTab`, `filter`, `page`.

## Renderização condicional

- `initial` → `NotSearching`
- `scanning` → `Searching`
- `unfollowing` → `Unfollowing`

`Toolbar` envolve todas as telas (idioma, settings, whitelist, ações globais).

## `isActiveProcess`

Usado para `beforeunload`: alerta se o usuário fecha a aba durante scan ativo ou unfollow incompleto.

## Preview local

- `onScan` com `isLocalPreview` preenche `_getPreviewUsers()` sem API.
- `useEffect` de scan e unfollow retornam cedo quando `isLocalPreview`.
- Query `?preview=scanning` inicializa estado `scanning` com dados mock.

## Débito conhecido

Comentário em `state.ts`: tipos de estado deveriam ser separados em arquivos distintos. Ver [engineering_backlog.md](engineering_backlog.md).
