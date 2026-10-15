# Visão do produto, riscos e privacidade

## O que o produto faz

Ferramenta **100% no navegador** que:

1. Lista quem você segue no Instagram mas **não segue você de volta**.
2. Permite whitelist, exportação e seleção para deixar de seguir em fila controlada.

Não há backend próprio: credenciais e cookies ficam na sessão do Instagram; requisições usam `credentials: 'same-origin'`.

## Privacidade

- Dados de scan, whitelist e timings ficam em `localStorage` do domínio `instagram.com` (ou do host de preview).
- Nada é enviado a servidores do mantenedor do fork, exceto o que o usuário exporta manualmente (JSON/CSV).

## Riscos e termos de uso

- Instagram pode limitar, bloquear ações (`feedback_required`, HTTP 429) ou encerrar sessão se detectar automação.
- O projeto **não** é afiliado ao Instagram/Meta.
- Uso por conta e risco do usuário; respeite limites configuráveis em Settings (timings).

## Mitigações no código

| Mecanismo | Onde |
| --- | --- |
| Pausas aleatórias entre páginas de scan | `paceRequest` em `main.tsx` |
| Sono longo a cada N requisições | `CHECKS_BEFORE_LONG_SLEEP` |
| Retry com cooldown em rate limit | `fetchPageWithRetry` |
| Parar unfollow em action block | `useEffect` unfollow em `main.tsx` |
| Não unfollow se scan de seguidores incompleto | `scanIncomplete` + UI |

Ver [08_fluxo_unfollow_rate_limit_action_block.md](08_fluxo_unfollow_rate_limit_action_block.md).

## Evolução (Social Unfollowers)

Este fork documenta extensão futura para outras redes (ex.: X.com) em [plans/multi-plataforma/](../plans/multi-plataforma/README.md). O comportamento atual permanece centrado no Instagram.
