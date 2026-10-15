const messages = {
  // Launch Screen
  localAccountAudit: "Auditoria local da conta",
  launchTitle: "Encontre quem você segue mas não te segue de volta.",
  launchDescription:
    "Escaneie quem você segue, revise sinais de risco, proteja contas na lista branca e aja apenas sobre os usuários selecionados (Instagram ou X).",
  runScan: "Iniciar escaneamento",
  runsInBrowserOnly: "Executa somente nesta sessão do navegador",
  loadCachedScan: "Carregar escaneo anterior (%s contas)",
  ready: "Pronto",
  protected: "Protegido",
  whitelist: "Lista branca",
  review: "Revisar",
  selectFirst: "Selecione primeiro",

  // Toolbar
  scanNoticeBanner: "⚡ Buscando contas em tempo real...",
  copyList: "Copiar lista",
  exportJson: "Exportar JSON",
  exportCsv: "Exportar CSV",
  unfollowSelected: "Deixar de seguir selecionados",
  selectPage: "Selecionar página",
  selectAll: "Selecionar todos",
  settings: "Configurações",
  goBackConfirm: "Voltar ao Instagram?",
  copiedToClipboard: "Lista copiada para a área de transferência!",

  // Scanner / Filters
  scanner: "Escaneamento",
  filters: "Filtros",
  nonFollowers: "Não te seguem",
  followers: "Te seguem",
  verified: "Verificados",
  private: "Privados",
  withoutProfilePicture: "Sem foto de perfil",
  searchPlaceholder: "Buscar usuários...",
  nonWhitelistedTab: "Fora da lista branca",
  whitelistedTab: "Na lista branca",
  addToWhitelist: "Adicionar à lista branca",
  removeFromWhitelist: "Remover da lista branca",
  noUsersFound: "Nenhum usuário encontrado com estes filtros.",
  page: "Página",
  of: "de",
  previous: "Anterior",
  next: "Próxima",
  pause: "Pausar",
  resume: "Retomar",
  partialScanWarning:
    "⚠️ Escaneamento incompleto: foi interrompido antes de verificar todas as contas; podem faltar não seguidores. O unfollow em massa foi desativado por segurança.",
  noPic: "Sem foto",
  clear: "Limpar",
  displayed: "Exibidos",
  totalScanned: "Total escaneados",
  scanSummary: "Resumo",
  unfollowCount: "Deixar de seguir (%s)",
  unfollowConfirm: "Tem certeza de que deseja deixar de seguir as contas selecionadas?",
  scanInProgressWait: "Escaneamento em andamento: aguarde terminar para deixar de seguir.",
  selectAtLeastOneUser: "Selecione pelo menos um usuário para deixar de seguir.",
  unfollowDisabledPartialScan: "Deixar de seguir desativado: o escaneamento não foi concluído por completo.",

  // Settings
  settingsTitle: "Configurações",
  timeBetweenSearchCycles: "Tempo entre ciclos de busca",
  timeToWaitAfterFiveCycles: "Tempo de espera após cinco ciclos de busca",
  timeBetweenUnfollows: "Tempo entre cada unfollow",
  timeToWaitAfterFiveUnfollows: "Tempo de espera após cinco unfollows",
  usersPerSearchCycle: "Usuários por requisição (quantidade)",
  settingsWarning1: "AVISO: alterar estes valores pode levar ao bloqueio da sua conta.",
  settingsWarning2: "USE POR SUA CONTA E RISCO!",
  saveSettings: "Salvar configurações",
  cancel: "Cancelar",
  save: "Salvar",
  warningPrefix: "AVISO:",

  // Whitelist Manager
  whitelistTitle: "Gerenciar lista branca",
  whitelistDescription: "Gerencie contas que deseja proteger de unfollow.",
  exportWhitelist: "Exportar lista branca",
  importWhitelist: "Importar lista branca",
  clearWhitelist: "Limpar lista branca",
  clearWhitelistConfirm: "Tem certeza de que deseja limpar a lista branca?",
  whitelistExported: "Lista branca exportada com sucesso!",
  whitelistImported: "Lista branca importada com sucesso!",
  whitelistCleared: "Lista branca limpa!",
  userSingular: "usuário",
  userPlural: "usuários",
  mergeWhitelist: "Mesclar (adicionar)",
  replaceWhitelist: "Substituir (sobrescrever)",
  whitelistTip:
    "Exporte a lista branca para backup. Você pode importá-la depois para restaurar os usuários salvos.",
  pasteWhitelist: "Colar usuários",
  pasteWhitelistPlaceholder: "Cole nomes de usuário aqui (separados por vírgula, espaço ou quebra de linha)...",
  addPastedToWhitelist: "Adicionar à lista branca",
  pastedUsersAdded: "%s novos usuários adicionados à lista branca!",
  noValidUsernamesFound: "Nenhum nome de usuário válido encontrado.",
  pastedUsersAlreadyExist: "Todos os usuários colados já estão na lista branca.",
  whitelistExportEmpty: "Não há usuários na lista branca para exportar.",
  whitelistNoUsers: "Nenhum usuário",
  whitelistImportMerged: "Mesclagem concluída! %s novos usuários (%s importados, %s duplicatas ignoradas).",
  whitelistImportReplaced: "Lista branca substituída por %s usuários.",
  importInvalidFileFormatArray: "Formato inválido: era esperado um array de usuários.",
  importInvalidFileFormatFields: "Formato inválido: usuários sem campos obrigatórios (id, username).",
  importParseFailed: "Falha ao interpretar JSON: %s",
  importReadFailed: "Falha ao ler o arquivo.",

  // Unfollowing Queue
  unfollowQueue: "Fila de unfollow",
  succeeded: "Sucesso",
  failed: "Falha",
  allDone: "Concluído!",
  unfollowed: "Deixou de seguir",
  failedToUnfollow: "Falha ao deixar de seguir",

  // Toasts & Notifications
  scanCompleted: "Escaneamento concluído!",
  scanFailedFollowing: "Falha no escaneamento: não foi possível carregar sua lista de seguidos.",
  scanFailedFollowers: "Falha no escaneamento: não foi possível carregar sua lista de seguidores.",
  indexingFollowersProgress: "Indexando seguidores (%s carregados)...",
  scanningFollowingProgress: "Verificando seguidos (%s revisados)...",
  partialScanInterrupted: "Escaneamento parcial: %s contas verificadas, mas o escaneamento foi interrompido.",
  rateLimitPause: "Cooldown do Instagram ativo. Pausando %s segundos antes de tentar novamente...",
  sleepingSafety: "Aguardando %s segundos para evitar bloqueio temporário",
  loadedFromCache: "%s contas carregadas do cache!",
  actionBlockedWarning:
    "⚠️ Bloqueio de ação do Instagram detectado (feedback_required). A fila foi interrompida para proteger sua conta.",

  // Host guard & misc
  hostGuardInstagramOnly: "Só pode ser usado nas rotas do Instagram.",
  hostGuardXOnly: "Só pode ser usado nas rotas do X.com.",
  hostGuardUnsupported: "Abra instagram.com ou x.com, faça login e cole o script na console.",
  filterChangeClearsSelection: "Alterar os filtros vai limpar a seleção atual. Continuar?",
  documentTitle: "Social Unfollowers — Instagram",
} as const;

export type TranslationKey = keyof typeof messages;

export function t(key: TranslationKey, ...args: (string | number)[]): string {
  let text: string = messages[key] ?? (key as string);
  for (const arg of args) {
    text = text.replace("%s", String(arg));
  }
  return text;
}
