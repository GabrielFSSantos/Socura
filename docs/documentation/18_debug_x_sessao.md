# Debug — sessão X.com

## Sintoma: alerta “Sessão do X inválida” ao colar o script

O `auth_token` do X é **HttpOnly** (não aparece em `document.cookie`). Versões antigas do bundle exigiam esse cookie no JS e bloqueavavam mesmo logado. Atualize o script (Pages ou `npm run serve` → copiar de novo).

## Sintoma: HTTP 401 em `followers/list.json`

1. Confirme login em `https://x.com` (mesma aba onde cola o script).
2. Recarregue a página (F5) antes de colar — o cookie `ct0` precisa estar acessível para o header CSRF.
2. Cole na console o snippet [`scripts/x-session-diagnose-snippet.js`](../../scripts/x-session-diagnose-snippet.js) (ou copie o conteúdo do arquivo).
3. Envie ao mantenedor apenas o JSON de saída (não inclui valores de cookies).

## Calibrar GraphQL (fallback)

Se REST continuar 401 após atualização do bundle:

1. DevTools → Network → filtre `graphql` ao abrir seguidores do seu perfil.
2. Copie o `queryId` da URL `.../graphql/<queryId>/Followers`.
3. No console do x.com:

```javascript
localStorage.setItem("iu_x_graphql_followers_query_id", "COLE_QUERY_ID");
localStorage.setItem("iu_x_graphql_following_query_id", "COLE_QUERY_ID_FOLLOWING");
```

4. Recarregue e rode o Social Unfollowers de novo.

## Testes automatizados locais

| Comando | Uso |
| --- | --- |
| `npm run test:unit` | Mocks/fixtures (CI) |
| `npm run e2e:record` | Login único → `e2e/.auth/storage-state.json` |
| `npm run e2e:live` | Preview smoke + scan X se sessão existir |

Ver [15_testes_e_gate.md](15_testes_e_gate.md).
