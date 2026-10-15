# Apêndice — chaves localStorage

Chaves derivadas de `getActiveAdapter().storageKeyPrefix` (`src/platform/storage-keys.ts`).

## Por plataforma

| Prefixo | Rede | Exemplo de chave |
| --- | --- | --- |
| `iu_ig_` | Instagram | `iu_ig_whitelisted-results` |
| `iu_x_` | X.com | `iu_x_whitelisted-results` |

| Sufixo | Conteúdo |
| --- | --- |
| `whitelisted-results` | JSON array de `UserNode` |
| `timings` | JSON objeto `Timings` |
| `last-scan-results` | JSON array de não-seguidores |
| `last-scan-time` | Epoch ms (string) |

## Legado Instagram (`iu_*` sem rede)

No Instagram (e preview Instagram), leitura com **fallback** para:

| Chave legada | Equivalente novo |
| --- | --- |
| `iu_whitelisted-results` | `iu_ig_whitelisted-results` |
| `iu_timings` | `iu_ig_timings` |
| `iu_last-scan-results` | `iu_ig_last-scan-results` |
| `iu_last-scan-time` | `iu_ig_last-scan-time` |

Novas gravações usam apenas o prefixo `iu_ig_`.

## Chaves obsoletas

| Chave | Nota |
| --- | --- |
| `iu_language` | Versões antigas (EN/ES); ignorar |

## Origem dos dados

Dados ficam no origin onde o script roda (`instagram.com` ou `x.com`); não há sincronização entre redes.
