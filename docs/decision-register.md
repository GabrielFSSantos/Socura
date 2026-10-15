# Registro de decisões

| ID | Data | Decisão | Motivo | Alternativas consideradas |
| --- | --- | --- | --- | --- |
| D-001 | — | Usar REST privado `/api/v1/friendships/` em vez de GraphQL público | GraphQL legado retorna 200 com listas vazias; scan falhava silenciosamente | Manter `query_hash` antigo |
| D-002 | — | Preact com alias `react` / `react-dom` no webpack | Bundle menor para script colado na console | React completo |
| D-003 | — | Índice de seguidores por `id` + `username` normalizado | Reduz falsos positivos quando `pk` / `pk_id` divergem | Só comparar por `pk` |
| D-004 | — | Abortar scan se lista de seguidores incompleta | Índice parcial marcaria seguidores reais como não-seguidores | Continuar com aviso |
| D-005 | — | `scanIncomplete` bloqueia unfollow em massa | Evita ações com dados errados após interrupção | Permitir unfollow sempre |
| D-006 | 2026 | Fork com visão **Socura** (Instagram + X.com) | Mesmo produto conceitual em várias redes | Renomear repo imediatamente |
| D-007 | — | Documentação só em `.md` no repo (sem PDFs de referência) | Foco em código e operação | Pasta `references/pdfs` como em outros labs |
| D-008 | — | Harness do agente fora do repo de produto | Meta-workspace dedicado; repo sem paths de harness externo | `AGENTS.md` na raiz do fork |
| D-009 | 2026 | UI e documentação em **PT-BR**; código e identificadores em **inglês** | Fork orientado a usuários e devs BR; manter alinhamento com convenções de código | i18n multilíngue (EN/ES); README bilíngue upstream |
| D-010 | 2026 | Produto canônico em **GabrielFSSantos/Socura** e Pages próprio | Independência de distribuição; fork com créditos explícitos | Continuar apontando Pages upstream; repo novo sem rede de fork |
| D-011 | 2026 | X.com MVP via **REST 1.1 interno** (`/i/api/1.1/`) com sessão web | Contrato mais estável que GraphQL com queryId volátil | Só GraphQL; API oficial paga |
| D-012 | 2026 | `localStorage` com prefixo `iu_ig_` / `iu_x_`; fallback `iu_*` só no Instagram | Evita colisão conceitual; migração suave IG | Prefixo único global |
| D-013 | 2026 | Scan único completo + **visões** pós-scan (`non_followers`, `following_all`, `followers_manage`) | Um passo de API; usuário alterna listas e ações sem reescanear | Três modos só na landing (scan parcial por modo) |

Ao registrar nova decisão, acrescente uma linha e atualize [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md) ou [PLATAFORMAS/](PLATAFORMAS/) se aplicável.
