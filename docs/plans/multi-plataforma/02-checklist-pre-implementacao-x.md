# Checklist pré-implementação — X.com

Marcar antes de escrever código de produção para X.

## Pesquisa

- [ ] Mapear endpoints privados equivalentes a following/followers (documentação interna / engenharia reversa responsável)
- [ ] Identificar headers obrigatórios e cookies de sessão no domínio `x.com`
- [ ] Confirmar fluxo de unfollow (ou “unfollow” equivalente) e respostas de block
- [ ] Ler termos de uso e políticas de automação do X

## Produto

- [ ] Definir nome na UI (“Social Unfollowers” vs marca por rede)
- [ ] Decidir se bundle único ou separado
- [ ] Definir idiomas suportados no lançamento X

## Técnico

- [ ] Implementar `InstagramAdapter` refatorado sem mudar comportamento (regressão manual IG)
- [ ] Protótipo `XAdapter` atrás de feature flag ou build separado
- [ ] Testes unitários para normalização `UserNode`
- [ ] Atualizar [04_api_instagram_friendships_e_headers.md](../../documentation/04_api_instagram_friendships_e_headers.md) ou novo capítulo `04_api_x_*` quando existir código

## Segurança e privacidade

- [ ] Revisar que nenhum token é enviado a servidores de terceiros
- [ ] Documentar riscos de banimento na [01_visao_produto_riscos_e_privacidade.md](../../documentation/01_visao_produto_riscos_e_privacidade.md)

## Pronto para merge

- [ ] Gate verde (`npm ci`, build, eslint)
- [ ] Scan + unfollow manuais em conta de teste X
- [ ] Entrada no [decision-register.md](../../decision-register.md) para escolhas de API X
