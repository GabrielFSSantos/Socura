# Produto — Socura

Ferramenta no navegador (Instagram e X) para auditar relações de follow e executar ações em fila, com lista branca e limites de segurança.

## Modos de auditoria

| Modo | O que lista | Ação em massa |
| --- | --- | --- |
| **Não seguidores** | Quem você segue e **não** te segue de volta | Deixar de seguir |
| **Todos que sigo** | Toda a lista de **seguindo** | Deixar de seguir |
| **Quem me segue** | **Seguidores** | Remover seguidor (quando a rede suporta) |

Escolha o modo na tela inicial antes de **Iniciar escaneamento**.

## Fluxo do usuário

1. Copie o script em [GitHub Pages](https://gabrielfssantos.github.io/Socura/) ou use `npm run dev`.
2. Cole no console em `instagram.com` ou `x.com` (após login).
3. Escolha o modo, inicie o scan e aguarde a lista.
4. Use a **lista branca** para proteger contas.
5. Selecione usuários e confirme a ação.

## Segurança

- Scan incompleto bloqueia ações em massa.
- Lista branca excluída de “selecionar todos”.
- Confirmação explícita e teto de ações por sessão.
- Dados só na sua sessão do navegador.

## Redes

Detalhes de API: [PLATAFORMAS/instagram.md](PLATAFORMAS/instagram.md), [PLATAFORMAS/x.md](PLATAFORMAS/x.md).
