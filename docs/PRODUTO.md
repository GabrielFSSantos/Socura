# Produto — Socura

Ferramenta no navegador (Instagram e X) para auditar relações de follow e executar ações em fila, com lista branca e limites de segurança.

## Escaneamento e visões

Um único **Iniciar escaneamento** carrega seguidores e seguindo. Depois, na barra lateral, você alterna a **visão** sem escanear de novo:

| Visão | O que lista | Ação em massa |
| --- | --- | --- |
| **Não seguidores** | Quem você segue e **não** te segue de volta | Deixar de seguir |
| **Todos que sigo** | Toda a lista de **seguindo** (com filtros de relação) | Deixar de seguir |
| **Quem me segue** | **Seguidores** | Remover seguidor (quando a rede suporta) |

## Fluxo do usuário

Como obter o script (Pages, clone local ou celular): **[README na raiz do repositório](../README.md#como-obter-o-script)**.

1. Copie o pacote de script (Pages ou laboratório local após `npm run dev`).
2. Cole no console em `instagram.com` ou `x.com` (após login).
3. Inicie o escaneamento e aguarde; depois escolha a visão na sidebar.
4. Use a **lista branca** para proteger contas.
5. Selecione usuários e confirme a ação.

## Segurança

- Scan incompleto bloqueia ações em massa.
- Lista branca excluída de “selecionar todos”.
- Confirmação explícita e teto de ações por sessão.
- Dados só na sua sessão do navegador.

## Redes

Detalhes de API: [PLATAFORMAS/instagram.md](PLATAFORMAS/instagram.md), [PLATAFORMAS/x.md](PLATAFORMAS/x.md).
