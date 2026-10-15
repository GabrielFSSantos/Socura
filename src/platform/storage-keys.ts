import { getActiveAdapter } from "./runtime";

export const LEGACY_INSTAGRAM_WHITELIST_KEY = "iu_whitelisted-results";
export const LEGACY_INSTAGRAM_TIMINGS_KEY = "iu_timings";
export const LEGACY_INSTAGRAM_LAST_SCAN_KEY = "iu_last-scan-results";
export const LEGACY_INSTAGRAM_LAST_SCAN_TIME_KEY = "iu_last-scan-time";

export function whitelistStorageKey(): string {
  return `${getActiveAdapter().storageKeyPrefix}whitelisted-results`;
}

export function timingsStorageKey(): string {
  return `${getActiveAdapter().storageKeyPrefix}timings`;
}

export function lastScanStorageKey(): string {
  return `${getActiveAdapter().storageKeyPrefix}last-scan-results`;
}

export function lastScanTimeStorageKey(): string {
  return `${getActiveAdapter().storageKeyPrefix}last-scan-time`;
}

export function useLegacyInstagramStorageFallback(): boolean {
  const id = getActiveAdapter().id;
  return id === "instagram" || id === "preview";
}
