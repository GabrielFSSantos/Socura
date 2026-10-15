# Visão Instagram + X — abstrações propostas

## Problema

Hoje `main.tsx` e `utils.ts` assumem:

- Host `www.instagram.com`
- Cookies `ds_user_id`, `csrftoken`
- REST `/api/v1/friendships/...`
- POST `/web/friendships/.../unfollow/`

X.com usa origem, cookies, endpoints e modelos de usuário diferentes.

## Camada sugerida: `PlatformAdapter`

Interface conceitual (a implementar no código):

```ts
interface SocialPlatformAdapter {
  readonly id: 'instagram' | 'x';
  readonly allowedHostnames: readonly string[];
  assertRuntime(): void; // host + login
  fetchFollowingPage(cursor?: string): Promise<Page<RawUser>>;
  fetchFollowersPage(cursor?: string): Promise<Page<RawUser>>;
  unfollow(userId: string): Promise<UnfollowResult>;
  getViewerId(): string | null;
}
```

## UI compartilhada

Manter Preact overlay com:

- Estados `initial` | `scanning` | `unfollowing` (genéricos)
- `UserNode` como modelo de exibição normalizado por adapter
- i18n com chaves por plataforma onde textos divergem (ex.: “Unfollow” vs “Deixar de seguir”)

## Host guard

Substituir comparação direta a `INSTAGRAM_HOSTNAME` por:

```ts
const adapter = resolveAdapter(location.hostname);
adapter.assertRuntime();
```

Preview local continua com adapter `mock` ou `instagram-preview`.

## Build

Opções futuras:

- Um bundle por plataforma (menor payload na console)
- Um bundle com adapters registrados e seleção por hostname

## Storage

Prefixar chaves `localStorage` por plataforma (`iu_ig_*`, `iu_x_*`) para evitar misturar listas.

## Ordem de implementação sugerida

1. Extrair adapter Instagram (comportamento idêntico ao atual)
2. Testes unitários no adapter
3. Spike read-only no X (somente listagem)
4. Unfollow X com mesmas proteções de rate limit
5. Documentar ToS e riscos específicos do X
