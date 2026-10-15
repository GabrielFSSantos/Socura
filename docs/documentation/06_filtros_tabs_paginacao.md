# Filtros, abas e paginação

## Abas (`ScanningTab`)

Definido em `src/model/scanning-tab.ts`:

- `non_whitelisted` — não-seguidores que não estão na whitelist
- `whitelisted` — entradas da whitelist presentes nos resultados

`getUsersForDisplay` em `utils.ts` aplica a aba antes dos filtros.

## Filtros de scan (`ScanningFilter`)

| Campo | Efeito |
| --- | --- |
| `showPrivate` | Oculta contas privadas se false |
| `showVerified` | Oculta verificadas se false |
| `showWithOutProfilePicture` | Usa `isWithoutProfilePicture` + IDs em `WITHOUT_PROFILE_PICTURE_URL_IDS` |

Sempre exclui usuários com `follows_viewer: true` (mutuais ou cache antigo).

Busca: substring em `username` e `full_name` (case insensitive).

## Paginação

- `UNFOLLOWERS_PER_PAGE` = 50 (`constants.ts`)
- `getCurrentPageUnfollowers` ordena por username e fatia a página
- `getMaxPage` calcula total de páginas
- `Searching.tsx` controla `state.page` e navegação

## Seleção em massa

- `toggleAllUsers` — todos os usuários **visíveis** após filtros/aba/busca
- `toggleCurrentePageUsers` — só a página atual

Alterar filtros com seleção ativa pede confirmação e limpa `selectedResults` (`handleScanFilter`).

## Filtros na tela de unfollow

`UnfollowFilter`: `showSucceeded` / `showFailed` em `getUnfollowLogForDisplay`.
