import { UserNode } from "../model/user";
import { Timings } from "../model/timings";
import {
  LEGACY_INSTAGRAM_LAST_SCAN_KEY,
  LEGACY_INSTAGRAM_LAST_SCAN_TIME_KEY,
  LEGACY_INSTAGRAM_TIMINGS_KEY,
  LEGACY_INSTAGRAM_WHITELIST_KEY,
  lastScanStorageKey,
  lastScanTimeStorageKey,
  timingsStorageKey,
  useLegacyInstagramStorageFallback,
  whitelistStorageKey,
} from "../platform/storage-keys";
import { t } from "./i18n";

/**
 * Export whitelist to a JSON file
 */
export const exportWhitelist = (whitelistedUsers: readonly UserNode[]): boolean => {
  if (whitelistedUsers.length === 0) {
    return false;
  }

  const dataStr = JSON.stringify(whitelistedUsers, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `instagram-whitelist-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
  return true;
};

/**
 * Import whitelist from a JSON file
 */
export const importWhitelist = (
  file: File,
  onSuccess: (users: readonly UserNode[]) => void,
  onError: (message: string) => void
): void => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const importedUsers = JSON.parse(content) as UserNode[];
      
      if (!Array.isArray(importedUsers)) {
        onError(t("importInvalidFileFormatArray"));
        return;
      }
      
      const isValid = importedUsers.every(user => 
        user.id && 
        user.username && 
        typeof user.id === "string" && 
        typeof user.username === "string"
      );
      
      if (!isValid) {
        onError(t("importInvalidFileFormatFields"));
        return;
      }
      
      onSuccess(importedUsers);
    } catch (error) {
      onError(t("importParseFailed", error instanceof Error ? error.message : "erro desconhecido"));
    }
  };
  
  reader.onerror = () => {
    onError(t("importReadFailed"));
  };
  
  reader.readAsText(file);
};

/**
 * Clear all whitelist data (caller should confirm with the user)
 */
export const clearWhitelist = (): void => {
  localStorage.removeItem(whitelistStorageKey());
  if (useLegacyInstagramStorageFallback()) {
    localStorage.removeItem(LEGACY_INSTAGRAM_WHITELIST_KEY);
  }
};

/**
 * Load whitelist from localStorage
 */
export const loadWhitelist = (): readonly UserNode[] => {
  try {
    let whitelistedResultsFromStorage = localStorage.getItem(whitelistStorageKey());
    if (!whitelistedResultsFromStorage && useLegacyInstagramStorageFallback()) {
      whitelistedResultsFromStorage = localStorage.getItem(LEGACY_INSTAGRAM_WHITELIST_KEY);
    }
    if (!whitelistedResultsFromStorage) {
      return [];
    }
    const parsed = JSON.parse(whitelistedResultsFromStorage);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Save whitelist to localStorage
 */
export const saveWhitelist = (whitelistedUsers: readonly UserNode[]): void => {
  try {
    localStorage.setItem(whitelistStorageKey(), JSON.stringify(whitelistedUsers));
  } catch (e) {
    console.warn("Could not save whitelist to storage:", e);
  }
};

/**
 * Merge imported whitelist with existing whitelist (avoiding duplicates)
 */
export const mergeWhitelists = (
  existing: readonly UserNode[],
  imported: readonly UserNode[]
): readonly UserNode[] => {
  const existingIds = new Set(existing.map(user => user.id));
  const uniqueImported = imported.filter(user => !existingIds.has(user.id));
  return [...existing, ...uniqueImported];
};

const isTimings = (value: unknown): value is Timings => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((timing) => typeof timing === "number");
};

/**
 * Load timings from localStorage
 */
export const loadTimings = (): Timings | null => {
  let timingsFromStorage = localStorage.getItem(timingsStorageKey());
  if (timingsFromStorage === null && useLegacyInstagramStorageFallback()) {
    timingsFromStorage = localStorage.getItem(LEGACY_INSTAGRAM_TIMINGS_KEY);
  }

  if (timingsFromStorage === null) {
    return null;
  }

  try {
    const parsedTimings: unknown = JSON.parse(timingsFromStorage);
    return isTimings(parsedTimings) ? parsedTimings : null;
  } catch {
    return null;
  }
};

/**
 * Save timings to localStorage
 */
export const saveTimings = (timings: Timings): void => {
  try {
    localStorage.setItem(timingsStorageKey(), JSON.stringify(timings));
  } catch (e) {
    console.warn("Could not save timings to storage:", e);
  }
};

/**
 * Cache completed scan results locally for instant recall
 */
export const saveCachedScanResults = (results: readonly UserNode[]): void => {
  try {
    localStorage.setItem(lastScanStorageKey(), JSON.stringify(results));
    localStorage.setItem(lastScanTimeStorageKey(), String(Date.now()));
  } catch (e) {
    console.warn("Could not cache scan results:", e);
  }
};

/**
 * Load cached scan results from localStorage
 */
export const loadCachedScanResults = (): { results: readonly UserNode[]; timestamp: number } | null => {
  try {
    let raw = localStorage.getItem(lastScanStorageKey());
    let time = localStorage.getItem(lastScanTimeStorageKey());
    if ((!raw || !time) && useLegacyInstagramStorageFallback()) {
      raw = raw ?? localStorage.getItem(LEGACY_INSTAGRAM_LAST_SCAN_KEY);
      time = time ?? localStorage.getItem(LEGACY_INSTAGRAM_LAST_SCAN_TIME_KEY);
    }
    if (!raw || !time) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return null;
    }
    return {
      results: parsed as readonly UserNode[],
      timestamp: Number(time),
    };
  } catch {
    return null;
  }
};
