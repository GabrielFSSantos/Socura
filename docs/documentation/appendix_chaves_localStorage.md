# Apêndice — chaves localStorage

Prefixo comum: `iu_` (Instagram Unfollowers).

| Chave | Constante | Conteúdo |
| --- | --- | --- |
| `iu_whitelisted-results` | `WHITELISTED_RESULTS_STORAGE_KEY` | JSON array de `UserNode` |
| `iu_timings` | `TIMINGS_STORAGE_KEY` | JSON objeto `Timings` |
| `iu_last-scan-results` | `LAST_SCAN_RESULTS_STORAGE_KEY` | JSON array de não-seguidores |
| `iu_last-scan-time` | `LAST_SCAN_TIMESTAMP_STORAGE_KEY` | Epoch ms string |

## Chaves obsoletas

| Chave | Nota |
| --- | --- |
| `iu_language` | Usada em versões anteriores (EN/ES). Pode ser ignorada ou removida manualmente; a UI atual não persiste idioma. |

## Origem dos dados

Todas as chaves são gravadas apenas no origin onde o script roda (`https://www.instagram.com` em produção).

## Migração multi-plataforma

Novas redes devem usar prefixo distinto (ex.: `su_x_whitelist`) para não colidir se o mesmo origin servir múltiplos scripts no futuro — ver plano multi-plataforma.
