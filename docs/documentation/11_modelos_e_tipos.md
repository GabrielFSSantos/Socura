# Modelos e tipos

## `UserNode` (`model/user.ts`)

Representa usuário na UI (id, username, `profile_pic_url`, flags `is_private`, `is_verified`, `follows_viewer`, etc.). Inclui estrutura `reel` herdada do formato Instagram.

## `State` (`model/state.ts`)

União discriminada por `status`:

- `initial`
- `scanning` — campos de lista, progresso, tabs, filtros
- `unfollowing` — log, progresso, filtros de log

## Filtros e tabs

- `ScanningFilter` — `model/scanning-filter.ts`
- `UnfollowFilter` — `model/unfollow-filter.ts`
- `ScanningTab` — `model/scanning-tab.ts`

## `Timings` (`model/timings.ts`)

Números em milissegundos (exceto contagens como `usersPerSearchCycle`).

## `UnfollowLogEntry` (`model/unfollow-log-entry.ts`)

`{ user: UserNode; unfollowedSuccessfully: boolean }`

## Utilitários de tipo

`assertUnreachable` em `utils.ts` força exaustividade em `switch` sobre `State` e tabs.

## API vs UI

`RawFriendshipUser` / `FriendshipsPage` são DTOs da API; conversão explícita para `UserNode` evita vazar campos instáveis na UI.
