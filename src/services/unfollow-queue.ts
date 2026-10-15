import { UserNode } from "../model/user";
import { Timings } from "../model/timings";
import { SocialPlatformAdapter } from "../platform/types";
import { sleep } from "../utils/utils";
import { t } from "../utils/i18n";

export interface UnfollowQueueCallbacks {
  onProgress: (entry: { user: UserNode; unfollowedSuccessfully: boolean }, percentage: number) => void;
  onActionBlocked: () => void;
  onSleepToast: (message: string) => void;
  onClearToast: () => void;
}

export async function runUnfollowQueue(
  adapter: SocialPlatformAdapter,
  users: readonly UserNode[],
  timings: Timings,
  callbacks: UnfollowQueueCallbacks,
): Promise<void> {
  let counter = 0;
  for (const user of users) {
    counter += 1;
    const percentage = Math.round((counter / users.length) * 100);
    try {
      const result = await adapter.unfollow(user.id);
      const success = result.success;
      if (!success) {
        console.warn(`Unfollow for ${user.username} failed (HTTP ${result.httpStatus}):`, result.message);
      }
      callbacks.onProgress({ user, unfollowedSuccessfully: success }, percentage);
      if (adapter.isActionBlockedUnfollow(result)) {
        callbacks.onActionBlocked();
        break;
      }
    } catch (e) {
      console.error(e);
      callbacks.onProgress({ user, unfollowedSuccessfully: false }, percentage);
    }
    if (user === users[users.length - 1]) {
      break;
    }
    await sleep(
      Math.floor(Math.random() * (timings.timeBetweenUnfollows * 1.2 - timings.timeBetweenUnfollows)) +
        timings.timeBetweenUnfollows,
    );
    if (counter % 5 === 0) {
      callbacks.onSleepToast(t("sleepingSafety", `${Math.round(timings.timeToWaitAfterFiveUnfollows / 60000)}m`));
      await sleep(timings.timeToWaitAfterFiveUnfollows);
      callbacks.onClearToast();
    }
  }
}
