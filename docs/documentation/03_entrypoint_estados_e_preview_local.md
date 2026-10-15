# Entrypoint, estados e preview local

## Bootstrap (`main.tsx` final)

```text
resolveAdapter(hostname, isLocalPreview, previewPlatform)
  → null: alert(hostGuardUnsupported)
  → adapter: setActiveAdapter → document.title → render(<App />)
```

Hosts de produção: `www.instagram.com` (Instagram), `x.com` / `twitter.com` / variantes (X). Preview: `localhost`, `127.0.0.1`, `::1` com adapter mock (`?platform=x` para UI X).

## Componente `App`

Orquestra:

- `state: State` — máquina de estados da UI
- `timings` — defaults do adapter + `loadTimings()`
- `cachedScan` — último scan em cache
- `scanningPaused` + `scanningPausedRef` — pausa cooperativa durante scan

Scan e unfollow reais delegam a `runAccountScan` / `runUnfollowQueue` com `getActiveAdapter()`.

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

`Toolbar` envolve todas as telas (`networkLabel` do adapter, settings, whitelist).

## `isActiveProcess`

Usado para `beforeunload`: alerta se o usuário fecha a aba durante scan ativo ou unfollow incompleto.

## Preview local

- `onScan` com `isLocalPreview` preenche `_getPreviewUsers()` sem API.
- `useEffect` de scan e unfollow retornam cedo quando `isLocalPreview`.
- Query `?preview=scanning` inicializa estado `scanning` com dados mock.
- `?platform=x` seleciona `previewXAdapter`.

## Débito conhecido

Comentário em `state.ts`: tipos de estado deveriam ser separados em arquivos distintos. Ver [engineering_backlog.md](engineering_backlog.md).
