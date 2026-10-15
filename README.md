# Socura

[![Maintenance](https://img.shields.io/maintenance/yes/2026)](https://github.com/GabrielFSSantos/Socura)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Curadoria e automação da sua conta nas redes — no navegador.** Audite seguidores e seguindo, liste branca, unfollow e remova seguidores no **Instagram** e **X.com** hoje; outras redes no futuro. Cole um script na console — sem extensão e sem enviar dados a servidores externos.

> **Transmissão ao vivo e cache:** as contas aparecem na tela em tempo real conforme cada lote é buscado. Escaneamentos concluídos ficam em cache local para reabrir a auditoria na hora, sem repetir chamadas desnecessárias à API.

## Como obter o script

Escolha um caminho:

| Caminho | Para quem |
| --- | --- |
| [GitHub Pages](#opção-a-github-pages-sem-instalar) | Uso rápido, sem Node |
| [Clone e lab local](#opção-b-clonar-e-rodar-local) | Build na sua máquina ou desenvolvimento |
| [Celular](#uso-no-celular) | Android (Eruda) ou lab na rede local |

Depois de ter o código copiado, siga [Colar no Instagram ou X](#colar-no-instagram-ou-x) (mesmo fluxo em todos os casos).

---

### Opção A: GitHub Pages (sem instalar)

1. Abra [Socura no GitHub Pages](https://gabrielfssantos.github.io/Socura/).
2. Clique em **Copiar código**.
   <br/><img src="./assets/copy_code.png" alt="Botão copiar código" />
3. Continue em [Colar no Instagram ou X](#colar-no-instagram-ou-x).

---

### Opção B: Clonar e rodar local

Requisitos: **Node 18+** e `npm`.

```bash
git clone https://github.com/GabrielFSSantos/Socura.git
cd Socura
npm ci
npm run dev
```

O comando `dev` gera o bundle e sobe o **lab** em **http://127.0.0.1:8765/**:

| URL | Uso |
| --- | --- |
| `/` | Hub com links |
| `/index.html` | Mesma landing do Pages — **copiar o script** para IG/X |
| `/preview.html` / `/preview-x.html` | UI de teste com dados fictícios (sem login) |

**Só gerar o arquivo, sem servidor:**

```bash
npm run build
```

O bundle fica em `dist/dist.js`. A landing atualizada é `public/index.html` (gerada a partir de `public/index.shell.html`).

**Colar na rede real:** copie o script de `/index.html` no lab (ou o conteúdo embutido após o build) e cole no console de [instagram.com](https://www.instagram.com) ou [x.com](https://x.com), logado — igual ao Pages, mas com o build da sua máquina.

---

### Colar no Instagram ou X

1. Faça login em [instagram.com](https://www.instagram.com) ou [x.com](https://x.com).
2. Abra o console do desenvolvedor:
   - Windows / Linux: `Ctrl + Shift + J`
   - macOS: `⌘ + ⌥ + I`
3. Cole o script e pressione `Enter`. A interface do Socura será exibida.
   - Se o navegador pedir confirmação antes de colar, digite **`allow pasting`** (em inglês) na console e pressione Enter; depois cole de novo.
   <br/><img src="./assets/initial.png" alt="Tela inicial" />
4. Escolha o **modo** (não seguidores, todos que sigo ou gerenciar seguidores) e clique em **Iniciar escaneamento** (ou **Carregar escaneo anterior**).
5. Durante o escaneamento, as contas vão aparecendo e o status de follow-back é atualizado.
   <br/><img src="./assets/results.png" alt="Tela de resultados" />
6. **Lista branca:** clique na foto do perfil para proteger contas.
7. **Configurações:** exportar, importar, colar ou limpar a lista branca; ajustar intervalos entre requisições.
   <br/><img src="./assets/settings_whitelist.png" alt="Lista branca nas configurações" />
   <br/><img src="./assets/settings.png" alt="Configurações" />
8. Marque os usuários desejados e use **Deixar de seguir** (ou **Remover seguidor**, no modo correspondente) quando o escaneamento terminar.

O **mesmo** script detecta a rede pelo site aberto (`instagram.com` vs `x.com`).

<br/><img src="./assets/initial_x.png" alt="Interface no preview X" />

Detalhes de produto: [docs/PRODUTO.md](docs/PRODUTO.md) · X: [docs/PLATAFORMAS/x.md](docs/PLATAFORMAS/x.md).

---

## Uso no celular

### Via GitHub Pages (Android)

1. Instale o [Eruda Android Browser](https://github.com/liriliri/eruda-android/releases/).
2. Abra o Instagram (ou X) no navegador do Eruda.
3. Abra a [página do Socura](https://gabrielfssantos.github.io/Socura/), copie o código e cole pela console do Eruda — mesmo fluxo do desktop.

### Lab na rede local (opcional)

Com `npm run dev`, o lab escuta em `0.0.0.0:8765`. No celular, na **mesma Wi‑Fi**, use `http://<IP-do-seu-PC>:8765/` (no WSL2, use o IP do Windows na rede local, não só `127.0.0.1`). Copie o script em `/index.html` e cole no site da rede social.

---

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
