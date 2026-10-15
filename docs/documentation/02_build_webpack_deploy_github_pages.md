# Build, Webpack e deploy (GitHub Pages)

## Pipeline npm

| Script | Efeito |
| --- | --- |
| `webpack-build` | Webpack modo production → `dist/dist.js` |
| `update-index` | Injeta `dist.js` em `public/index.html` |
| `build` | `webpack-build` + `update-index` |
| `build-dev` / `build-prod` | `build` + `webpack serve` |

## Webpack (`webpack.config.js`)

- **Entry:** `src/main.tsx`
- **Output:** `dist/dist.js`
- **Alias:** `react` → `preact/compat`, `react-dom` → `preact/compat`
- **Loaders:** `ts-loader`, `sass-loader` + `css-loader` + `style-loader`

## `public/index.html`

O script `scripts/update-index.js` substitui **apenas** o bundle minificado (`instagramScript`) após cada build. Textos da landing (título, botões, overlay) ficam no HTML estático e podem ser editados fora desse bloco.

Fluxo de release típico:

1. Merge em `master` dispara `build_and_deploy_pages.yaml`.
2. CI executa build e publica Pages com o HTML contendo o bundle.

## GitHub Pages (canônico)

- URL pública do script: **https://gabrielfssantos.github.io/Social-Unfollowers/**
- Repositório: **https://github.com/GabrielFSSantos/Social-Unfollowers**
- Configuração: Settings → Pages → source **GitHub Actions** (workflow `build_and_deploy_pages.yaml`).

## Artefatos locais

- `dist/dist.js` — bundle único colável na console (via HTML empacotado).
- `public/preview.html` — ambiente de desenvolvimento visual sem Instagram.

## Variáveis de ambiente

Não há `.env` no build: constantes de app Instagram estão em `src/constants/constants.ts` (`INSTAGRAM_WEB_APP_ID`, `INSTAGRAM_ASBD_ID`).
