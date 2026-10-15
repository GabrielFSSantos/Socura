# Apêndice — contratos API X.com

Resumo rápido; detalhes em [16_api_x_graphql_sessao.md](16_api_x_graphql_sessao.md).

## Seguidores

```http
GET /i/api/1.1/followers/list.json?user_id={viewerId}&count={n}&cursor={cursor}
```

## Seguindo

```http
GET /i/api/1.1/friends/list.json?user_id={viewerId}&count={n}&cursor={cursor}
```

## Unfollow

```http
POST /i/api/1.1/friendships/destroy.json
Content-Type: application/x-www-form-urlencoded

user_id={targetUserId}
```

## Campos mapeados para `UserNode`

| X | App |
| --- | --- |
| `id_str` | `id` |
| `screen_name` | `username` |
| `name` | `full_name` |
| `profile_image_url_https` | `profile_pic_url` |
| `protected` | `is_private` |
| `verified` | `is_verified` |
