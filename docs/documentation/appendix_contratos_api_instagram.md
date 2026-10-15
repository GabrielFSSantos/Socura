# Apêndice — contratos API Instagram (uso atual)

**Não oficial.** Instagram pode alterar formatos sem aviso.

## GET friendships

**Request**

```http
GET /api/v1/friendships/{userId}/followers/?count=50&max_id={cursor}
Cookie: sessionid=...; ds_user_id=...; csrftoken=...
X-IG-App-ID: 936619743392459
X-ASBD-ID: 129477
X-Requested-With: XMLHttpRequest
```

Troque `followers` por `following` para a lista de seguindo.

**Response (campos usados)**

```json
{
  "users": [ { "pk": "...", "username": "...", "profile_pic_url": "..." } ],
  "next_max_id": "...",
  "has_more": true,
  "status": "ok"
}
```

Falha lógica: `status: "fail"` ou `message` sem `users`.

## POST unfollow

```http
POST /web/friendships/{targetUserId}/unfollow/
X-CSRFToken: {csrftoken}
X-IG-App-ID: 936619743392459
X-ASBD-ID: 129477
X-Requested-With: XMLHttpRequest
Content-Type: application/x-www-form-urlencoded
```

Sucesso típico: HTTP 200 e JSON sem `status: "fail"`. Bloqueios frequentes: 400/429, `feedback_required`.

## Cookies relevantes

| Cookie | Uso |
| --- | --- |
| `ds_user_id` | ID do viewer nas URLs |
| `csrftoken` | Header CSRF em GET/POST |

Implementação: `getCookie` em `utils.ts`.
