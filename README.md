# Socura

[![Maintenance](https://img.shields.io/maintenance/yes/2026)](https://github.com/GabrielFSSantos/Socura)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Curadoria e automação da sua conta nas redes — no navegador.** Audite seguidores e seguindo, liste branca, unfollow e remova seguidores no **Instagram** e **X.com** hoje; outras redes no futuro. Cole um script na console — sem extensão e sem enviar dados a servidores externos.

> **Transmissão ao vivo e cache:** as contas aparecem na tela em tempo real conforme cada lote é buscado. Escaneamentos concluídos ficam em cache local para reabrir a auditoria na hora, sem repetir chamadas desnecessárias à API.

## Uso no computador

1. Abra a página do script: [Socura no GitHub Pages](https://gabrielfssantos.github.io/Socura/) (desenvolvedores: edite `public/index.shell.html` e rode `npm run build` para gerar `public/index.html`).
2. Copie o código com o botão **Copiar código**.
   <br/><img src="./assets/copy_code.png" alt="Botão copiar código" />
3. Acesse [instagram.com](https://www.instagram.com) ou [x.com](https://x.com), faça login.
4. Abra o console do desenvolvedor:
   - Windows / Linux: `Ctrl + Shift + J`
   - macOS: `⌘ + ⌥ + I`
5. Cole o script e pressione `Enter`. A interface do Socura será exibida.
   - Se o navegador pedir confirmação antes de colar, digite **`allow pasting`** (em inglês) na console e pressione Enter; depois cole de novo. É proteção padrão do Chrome/Edge — revise o código na [página do projeto](https://gabrielfssantos.github.io/Socura/) ou no repositório antes de colar.
   <br/><img src="./assets/initial.png" alt="Tela inicial" />
6. Escolha o **modo** (não seguidores, todos que sigo ou gerenciar seguidores) e clique em **Iniciar escaneamento** (ou **Carregar escaneo anterior**).
7. Durante o escaneamento, as contas vão aparecendo e o status de follow-back é atualizado.
   <br/><img src="./assets/results.png" alt="Tela de resultados" />
8. **Lista branca:** clique na foto do perfil para proteger contas do unfollow.
9. **Configurações:** exportar, importar, colar ou limpar a lista branca; ajustar intervalos entre requisições.
   <br/><img src="./assets/settings_whitelist.png" alt="Lista branca nas configurações" />
   <br/><img src="./assets/settings.png" alt="Configurações" />
10. Marque os usuários desejados e use **Deixar de seguir** quando o escaneamento terminar.

O **mesmo** script detecta a rede pelo site aberto (`instagram.com` vs `x.com`). No X, o fluxo é equivalente (scan, lista branca, unfollow em fila).

<br/><img src="./assets/initial_x.png" alt="Interface no preview X" />

Detalhes: [docs/PRODUTO.md](docs/PRODUTO.md) e [docs/PLATAFORMAS/x.md](docs/PLATAFORMAS/x.md).

## Uso no celular (Android)

1. Instale o [Eruda Android Browser](https://github.com/liriliri/eruda-android/releases/).
2. Abra o Instagram web pelo Eruda.
3. Siga os mesmos passos do desktop (console via ícone do Eruda).

## Funcionalidades

- **Três modos:** não seguidores, revisar todos que você segue, listar seguidores para remover.
- **Escaneamento:** identifica quem não te segue de volta (modo padrão).
- **Streaming progressivo:** resultados aparecem por lote, sem tela vazia em contas grandes.
- **Cache local:** reabra escaneamentos concluídos sem refazer tudo.
- **Proteção de sessão:** headers da web do Instagram (`X-ASBD-ID`, `X-CSRFToken`, etc.) para reduzir logouts forçados.
- **Action block:** valida respostas de unfollow e para a fila em `feedback_required`.
- **Rate limit:** pausas e backoff em HTTP 429 / 400.
- **Escaneamento incompleto:** unfollow em massa desabilitado se o scan foi interrompido.
- **Lista branca persistente:** JSON, import/export e colagem em massa de usernames.
- **Timings configuráveis** nas configurações.
- **Privacidade:** processamento 100% no navegador; nada é enviado a servidores do projeto.

## Documentação técnica

Guia completo do código, fluxos, API Instagram, build e gate:

**[docs/README.md](docs/README.md)**

## Desenvolvimento

| Comando | Uso |
| --- | --- |
| **`npm run dev`** | Lab local em **http://127.0.0.1:8765** (copiar bundle para IG/X) |
| **`npm test`** | Testes sem login (unitários + preview) — gate |
| **`npm run test:session`** | Testes logados no Chrome (funcionalidades reais) |

Também: `npm run build`, `npm run test:verify` (fechamento completo), `npm run auth` para gravar sessão E2E.

Detalhes: **[docs/DESENVOLVIMENTO.md](docs/DESENVOLVIMENTO.md)** · **[docs/README.md](docs/README.md)**

O CI gera `public/index.html` a partir de `public/index.shell.html`. Evite editar o bloco do script manualmente; textos e estilos da landing ficam no shell e em `public/landing.css`.

## Origem e créditos

Este projeto é um **fork independente** derivado de [InstagramUnfollowers](https://github.com/davidarroyo1234/InstagramUnfollowers) por David Arroyo (licença MIT). O código original permanece sob copyright do autor upstream; as modificações e a manutenção desta linha são de Gabriel F. S. Santos. Detalhes: [NOTICE.md](NOTICE.md).

## Legal

**Aviso:** esta ferramenta **não** é afiliada ao Instagram/Meta nem ao X Corp.

**Use por sua conta e risco.** Automatizar ações pode violar os Termos de Uso da plataforma.

Licença: [MIT](LICENSE).
