# Quickstart

## Pré-requisitos

- Node.js 16+ (recomendado 18 ou 20; ver `.nvmrc`)
- npm

## Desenvolvimento local

```bash
cd Social-Unfollowers
npm install
npm run build          # produção → dist/dist.js + atualiza public/index.html
npm run build-dev      # build + webpack-dev-server com live reload
```

## Preview sem Instagram

O app aceita `localhost`, `127.0.0.1` e `::1` como hosts de preview (`isLocalPreview` em `src/main.tsx`).

1. Execute `npm run build`.
2. Sirva ou abra `public/preview.html` (ou use `build-dev` e a URL do dev server).
3. Opcional: `?preview=scanning` na URL inicia direto na tela de resultados com dados fictícios.

No preview, scan e unfollow **não** chamam a API real.

## Uso em produção (Instagram)

1. Acesse [GitHub Pages — Social Unfollowers](https://gabrielfssantos.github.io/Social-Unfollowers/).
2. Copie o script (botão na página ou conteúdo gerado em `public/index.html` após o build).
3. Em `https://www.instagram.com/`, logado, abra o DevTools (console).
4. Cole o script e confirme a interface overlay.

O bootstrap recusa outros domínios: apenas `INSTAGRAM_HOSTNAME` (`www.instagram.com`) ou preview local.

## Próximos passos

- [12_fluxo_ponta_a_ponta.md](12_fluxo_ponta_a_ponta.md) — jornada do usuário
- [13_guia_dev_e_agente.md](13_guia_dev_e_agente.md) — mapa para quem altera código
