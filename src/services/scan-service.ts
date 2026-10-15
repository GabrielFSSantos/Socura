import { UserNode } from "../model/user";
import { Timings } from "../model/timings";
import { CHECKS_BEFORE_LONG_SLEEP, RATE_LIMIT_COOLDOWN_SECONDS } from "../constants/constants";
import { addGraphUserToIndex, createGraphUserIndex, isGraphUserInIndex } from "../platform/graph-index";
import { GraphUser, PlatformApiError, SocialPlatformAdapter } from "../platform/types";
import { sleep } from "../utils/utils";
import { t } from "../utils/i18n";

export interface ScanCallbacks {
  onToast: (text: string) => void;
  onClearToast: () => void;
  onFollowersProgress: (followersCount: number, percentage: number) => void;
  onFollowingProgress: (
    checkedCount: number,
    percentage: number,
    newNonFollowers: readonly UserNode[],
  ) => void;
  onFollowersFailed: () => void;
  onFollowingFailedEarly: () => void;
  onComplete: (result: {
    nonFollowers: readonly UserNode[];
    checkedCount: number;
    scanIsComplete: boolean;
  }) => void;
  isPaused: () => boolean;
}

export async function runAccountScan(
  adapter: SocialPlatformAdapter,
  timings: Timings,
  callbacks: ScanCallbacks,
): Promise<void> {
  const viewerId = adapter.getViewerId();
  if (!viewerId) {
    callbacks.onFollowingFailedEarly();
    callbacks.onToast(t("scanFailedFollowing"));
    return;
  }

  type PageResult =
    | { readonly ok: true; readonly page: Awaited<ReturnType<SocialPlatformAdapter["fetchFollowersPage"]>> }
    | { readonly ok: false; readonly blocked: boolean };

  const fetchPageWithRetry = async (
    kind: "followers" | "following",
    cursor?: string,
  ): Promise<PageResult> => {
    let retries = 0;
    const maxRetries = 3;
    while (true) {
      try {
        const page =
          kind === "followers"
            ? await adapter.fetchFollowersPage(cursor, timings.usersPerSearchCycle)
            : await adapter.fetchFollowingPage(cursor, timings.usersPerSearchCycle);
        return { ok: true, page };
      } catch (e: unknown) {
        const isTransient = adapter.isTransientFetchError(e);
        const status = e instanceof PlatformApiError ? e.status : 0;
        if (isTransient && retries < maxRetries) {
          retries++;
          const waitSeconds = status === 429 || (e instanceof PlatformApiError && e.retryable)
            ? RATE_LIMIT_COOLDOWN_SECONDS * retries
            : 5 * retries;
          for (let sec = waitSeconds; sec > 0; sec--) {
            callbacks.onToast(t("rateLimitPause", sec));
            await sleep(1000);
          }
          callbacks.onClearToast();
          continue;
        }
        console.error(`${kind} request failed:`, e);
        return { ok: false, blocked: isTransient };
      }
    }
  };

  let requestsSinceLongSleep = 0;
  const paceRequest = async () => {
    while (callbacks.isPaused()) {
      await sleep(1000);
    }
    await sleep(Math.floor(Math.random() * 700) + 300);
    await sleep(
      Math.floor(
        Math.random() * (timings.timeBetweenSearchCycles - timings.timeBetweenSearchCycles * 0.7),
      ) + timings.timeBetweenSearchCycles,
    );
    requestsSinceLongSleep++;
    if (requestsSinceLongSleep >= CHECKS_BEFORE_LONG_SLEEP) {
      requestsSinceLongSleep = 0;
      const longSleepVar = Math.max(
        0,
        timings.timeToWaitAfterFiveSearchCycles + (Math.random() * 10000 - 5000),
      );
      callbacks.onToast(t("sleepingSafety", Math.round(longSleepVar / 1000)));
      await sleep(longSleepVar);
      callbacks.onClearToast();
    }
  };

  const fetchList = async (
    kind: "followers" | "following",
    pageSafetyLimit: number,
    onPageUsers: (pageUsers: readonly GraphUser[]) => Promise<boolean>,
  ): Promise<boolean> => {
    let cursor: string | undefined;
    let pagesFetched = 0;
    while (true) {
      const result = await fetchPageWithRetry(kind, cursor);
      if (!result.ok) {
        return false;
      }
      const page = result.page;
      if (!(await onPageUsers(page.users))) {
        return false;
      }
      if (!page.hasMore || page.users.length === 0) {
        return true;
      }
      pagesFetched++;
      if (pagesFetched >= pageSafetyLimit) {
        return false;
      }
      cursor = page.nextCursor;
      await paceRequest();
    }
  };

  const followerIndex = createGraphUserIndex();
  let followersCount = 0;

  const followersCompleted = await fetchList(
    "followers",
    adapter.followersPageSafetyLimit,
    async pageUsers => {
      for (const user of pageUsers) {
        addGraphUserToIndex(followerIndex, user);
        followersCount++;
      }
      const followersProgress = Math.min(49, Math.round(50 * (1 - 1 / (1 + followersCount / 150))));
      callbacks.onFollowersProgress(followersCount, followersProgress);
      callbacks.onToast(t("indexingFollowersProgress", followersCount));
      return true;
    },
  );

  if (!followersCompleted) {
    callbacks.onFollowersFailed();
    callbacks.onToast(t("scanFailedFollowers"));
    return;
  }

  callbacks.onFollowersProgress(followersCount, 50);

  const nonFollowers: UserNode[] = [];
  let checkedCount = 0;

  const followingCompleted = await fetchList(
    "following",
    adapter.followingPageSafetyLimit,
    async pageUsers => {
      const batch: UserNode[] = [];
      for (const user of pageUsers) {
        const followsViewer = isGraphUserInIndex(followerIndex, user);
        if (!followsViewer) {
          const node = adapter.graphUserToUserNode(user, false);
          nonFollowers.push(node);
          batch.push(node);
        }
        checkedCount++;
      }
      const followingProgress = Math.min(99, 50 + Math.round(50 * (1 - 1 / (1 + checkedCount / 150))));
      callbacks.onFollowingProgress(checkedCount, followingProgress, batch);
      callbacks.onToast(t("scanningFollowingProgress", checkedCount));
      return true;
    },
  );

  if (!followingCompleted && checkedCount === 0) {
    callbacks.onFollowingFailedEarly();
    callbacks.onToast(t("scanFailedFollowing"));
    return;
  }

  const scanIsComplete = followingCompleted;
  callbacks.onComplete({ nonFollowers, checkedCount, scanIsComplete });
  callbacks.onToast(
    scanIsComplete ? t("scanCompleted") : t("partialScanInterrupted", checkedCount),
  );
}
