# Whitelist, timings e cache de scan

Módulo: `src/utils/whitelist-manager.ts`. Chaves em `src/constants/constants.ts`.

## Whitelist

| Função | Comportamento |
| --- | --- |
| `loadWhitelist` / `saveWhitelist` | JSON em `iu_whitelisted-results` |
| `exportWhitelist` | Download JSON datado |
| `importWhitelist` | Valida `id` + `username` |
| `mergeWhitelists` | União sem duplicar por `id` |
| `clearWhitelist` | Remove chave após confirm |

Na UI: clique na foto do perfil (componentes em `Searching`), gestão em `WhitelistManager` / `SettingMenu`.

## Timings

Tipo `Timings` (`model/timings.ts`):

- `timeBetweenSearchCycles`
- `timeToWaitAfterFiveSearchCycles`
- `timeBetweenUnfollows`
- `timeToWaitAfterFiveUnfollows`
- `usersPerSearchCycle`

Persistidos em `iu_timings`. Defaults em `constants.ts`. `App` salva no `useEffect` quando `timings` mudam.

## Cache de scan

| Função | Chaves |
| --- | --- |
| `saveCachedScanResults` | `iu_last-scan-results` + `iu_last-scan-time` |
| `loadCachedScanResults` | Retorna `{ results, timestamp }` ou null |

Tela inicial (`NotSearching`) oferece carregar cache instantâneo via `onLoadCached` sem novas requisições.

## Limitações

- `localStorage` tem quota por origem; listas muito grandes podem falhar (warnings no console).
- Cache não expira automaticamente por tempo; usuário pode rodar novo scan para atualizar.

Ver [appendix_chaves_localStorage.md](appendix_chaves_localStorage.md).
