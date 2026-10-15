# Quickstart

## Pré-requisitos

- Node.js 16+ (recomendado 18 ou 20; ver `.nvmrc`)
- npm
- WSL: Playwright Chromium global — `~/bin/dev-runtime-install.sh` (ver `Workspaces/_shared/dev-runtime/README.md`)

## Desenvolvimento local

```bash
cd Social-Unfollowers
npm install
npm run build          # produção → dist/dist.js + atualiza public/index.html
npm run build-dev      # build + webpack-dev-server com live reload
npm run test:unit          # testes unitários (índice + parser X)
npm run e2e:live -- --grep preview   # smoke UI (após build + playwright install chromium)
npm run e2e:record         # uma vez: login no X → e2e/.auth/storage-state.json
```

## Lab local (um comando)

```bash
npm run serve
```

Abra **http://127.0.0.1:8765/** — hub com links para preview Instagram/X e página para copiar o script.

Porta alternativa: `LAB_PORT=9000 npm run serve`.

## Preview sem rede social

Hosts de preview: `localhost`, `127.0.0.1`, `::1` (`isLocalPreview` em `src/main.tsx`).

- `/preview.html` — Instagram mock  
- `/preview-x.html` — X mock  
- `?preview=scanning` — resultados fictícios já carregados  

Scan e unfollow no preview **não** chamam APIs reais.

## Uso em produção (Instagram ou X)

1. Acesse [GitHub Pages — Social Unfollowers](https://gabrielfssantos.github.io/Social-Unfollowers/).
2. Copie o script (botão na página ou conteúdo gerado em `public/index.html` após o build).
3. Em **`https://www.instagram.com/`** ou **`https://x.com/`**, logado, abra o DevTools (console).
4. Cole o script e confirme a interface overlay.
   - Aviso do Chrome/Edge (“Don’t paste code…”): na console, digite `allow pasting` e Enter; em seguida cole o script outra vez.

O bootstrap usa `resolveAdapter(location.hostname)`: hosts suportados são Instagram (`www.instagram.com`), X (`x.com`, `twitter.com`, etc.) ou preview local. Outros domínios exibem `hostGuardUnsupported`.

## Próximos passos

- [12_fluxo_ponta_a_ponta.md](12_fluxo_ponta_a_ponta.md) — jornada Instagram
- [17_fluxo_escaneamento_x.md](17_fluxo_escaneamento_x.md) — jornada X
- [13_guia_dev_e_agente.md](13_guia_dev_e_agente.md) — mapa para quem altera código
