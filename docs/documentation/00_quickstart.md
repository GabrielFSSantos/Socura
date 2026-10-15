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
npm run test:graph-index   # testes unitários do índice de seguidores
```

## Preview sem rede social

O app aceita `localhost`, `127.0.0.1` e `::1` como hosts de preview (`isLocalPreview` em `src/main.tsx`).

1. Execute `npm run build`.
2. Abra `public/preview.html` (Instagram) ou `public/preview-x.html` / `?platform=x` (X).
3. Opcional: `?preview=scanning` inicia direto na tela de resultados com dados fictícios.

No preview, scan e unfollow **não** chamam APIs reais.

## Uso em produção (Instagram ou X)

1. Acesse [GitHub Pages — Social Unfollowers](https://gabrielfssantos.github.io/Social-Unfollowers/).
2. Copie o script (botão na página ou conteúdo gerado em `public/index.html` após o build).
3. Em **`https://www.instagram.com/`** ou **`https://x.com/`**, logado, abra o DevTools (console).
4. Cole o script e confirme a interface overlay.

O bootstrap usa `resolveAdapter(location.hostname)`: hosts suportados são Instagram (`www.instagram.com`), X (`x.com`, `twitter.com`, etc.) ou preview local. Outros domínios exibem `hostGuardUnsupported`.

## Próximos passos

- [12_fluxo_ponta_a_ponta.md](12_fluxo_ponta_a_ponta.md) — jornada Instagram
- [17_fluxo_escaneamento_x.md](17_fluxo_escaneamento_x.md) — jornada X
- [13_guia_dev_e_agente.md](13_guia_dev_e_agente.md) — mapa para quem altera código
