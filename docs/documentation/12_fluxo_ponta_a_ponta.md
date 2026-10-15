# Fluxo ponta a ponta

## Timeline (usuário no Instagram)

```text
1. Colar bundle na console em www.instagram.com (logado)
2. Tela initial → Iniciar escaneamento OU Carregar escaneo anterior
3. [Scan] Fase followers → índice em memória
4. [Scan] Fase following → não-seguidores aparecem na lista
5. Revisar: busca, filtros, abas, whitelist (clique na foto)
6. Selecionar checkboxes → Unfollow
7. [Unfollow] Fila POST com pausas → log sucesso/falha
8. Export JSON/CSV opcional; Settings para timings e whitelist
```

## Timeline (desenvolvedor)

```text
git clone → npm ci → npm run build
→ testar public/preview.html
→ alterar src/ → build-dev ou build
→ gate: npm run build + eslint
→ CI publica index.html em Pages
```

## Dados persistidos entre sessões

- Whitelist (`iu_whitelisted-results`)
- Timings (`iu_timings`)
- Último scan (`iu_last-scan-results`, `iu_last-scan-time`)
## Falhas comuns

| Sintoma | Causa provável | Doc |
| --- | --- | --- |
| 0 resultados instantâneo | Não logado / cookie `ds_user_id` | [05](05_fluxo_escaneamento.md) |
| Scan para no meio | Rate limit ou cap de páginas | [05](05_fluxo_escaneamento.md), [04](04_api_instagram_friendships_e_headers.md) |
| Unfollow para cedo | Action block Instagram | [08](08_fluxo_unfollow_rate_limit_action_block.md) |
| Alerta de host (somente Instagram) | Host errado | [03](03_entrypoint_estados_e_preview_local.md) |
