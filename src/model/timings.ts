export interface Timings {
  timeBetweenSearchCycles: number;
  timeToWaitAfterFiveSearchCycles: number;
  timeBetweenUnfollows: number;
  timeToWaitAfterFiveUnfollows: number;
  usersPerSearchCycle?: number;
  /** Limite de unfollow/remove por sessão (segurança). */
  maxBulkActionsPerSession?: number;
}
