# Visão do produto, riscos e privacidade

## O que o produto faz

Ferramenta **100% no navegador** que:

1. Lista quem você segue na rede ativa (Instagram ou X.com) mas **não segue você de volta**.
2. Permite whitelist, exportação e seleção para deixar de seguir em fila controlada.

Não há backend próprio: credenciais e cookies ficam na sessão da rede social; requisições usam `credentials: 'same-origin'`.

## Privacidade

- Dados de scan, whitelist e timings ficam em `localStorage` do domínio da rede (`instagram.com`, `x.com`) ou do host de preview.
- Nada é enviado a servidores do mantenedor do fork, exceto o que o usuário exporta manualmente (JSON/CSV).

## Riscos e termos de uso

- Instagram ou X podem limitar, bloquear ações (HTTP 429/403, `feedback_required` no IG) ou encerrar sessão se detectar automação.
- O projeto **não** é afiliado ao Instagram/Meta nem ao X Corp.
- No X, automação em massa viola os Termos de Serviço com risco de suspensão permanente.
- Uso por conta e risco do usuário; respeite limites configuráveis em Settings (timings).

## Mitigações no código

| Mecanismo | Onde |
| --- | --- |
| Pausas aleatórias entre páginas de scan | `scan-service.ts` |
| Sono longo a cada N requisições | `CHECKS_BEFORE_LONG_SLEEP` |
| Retry com cooldown em rate limit | `fetchPageWithRetry` no scan |
| Parar unfollow em action block | `unfollow-queue.ts` |
| Não unfollow se scan de seguidores incompleto | `scanIncomplete` + UI |

Ver [08_fluxo_unfollow_rate_limit_action_block.md](08_fluxo_unfollow_rate_limit_action_block.md).

## X.com

Mesmo fluxo de privacidade (local only). API documentada em [16_api_x_graphql_sessao.md](16_api_x_graphql_sessao.md). Chaves `localStorage` usam prefixo `iu_x_` no domínio `x.com`.

## Evolução (Social Unfollowers)

Roadmap e abstrações: [plans/multi-plataforma/](../plans/multi-plataforma/README.md).
