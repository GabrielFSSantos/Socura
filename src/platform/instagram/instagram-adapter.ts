import { UserNode } from "../../model/user";
import { Timings } from "../../model/timings";
import {
  DEFAULT_TIME_BETWEEN_SEARCH_CYCLES,
  DEFAULT_TIME_BETWEEN_UNFOLLOWS,
  DEFAULT_TIME_TO_WAIT_AFTER_FIVE_SEARCH_CYCLES,
  DEFAULT_TIME_TO_WAIT_AFTER_FIVE_UNFOLLOWS,
  DEFAULT_USERS_PER_SEARCH_CYCLE,
  FOLLOWERS_PAGE_SAFETY_LIMIT,
  FOLLOWING_PAGE_SAFETY_LIMIT,
  INSTAGRAM_ASBD_ID,
  INSTAGRAM_WEB_APP_ID,
} from "../../constants/constants";
import {
  fetchFriendshipsPage,
  FriendshipsListKind,
  getCookie,
  InstagramApiError,
  rawFriendshipUserToUserNode,
  removeFollowerUserUrlGenerator,
  unfollowUserUrlGenerator,
} from "../../utils/utils";
import { GraphPage, GraphUser, PlatformApiError, SocialPlatformAdapter, UnfollowResult } from "../types";

const INSTAGRAM_STORAGE_PREFIX = "iu_ig_";

function rawToGraphUser(raw: {
  pk: string | number;
  pk_id?: string;
  username: string;
  full_name?: string;
  profile_pic_url: string;
  is_private?: boolean;
  is_verified?: boolean;
}): GraphUser {
  return {
    id: String(raw.pk_id ?? raw.pk),
    username: raw.username,
    displayName: raw.full_name ?? "",
    profilePicUrl: raw.profile_pic_url,
    isPrivate: raw.is_private ?? false,
    isVerified: raw.is_verified ?? false,
  };
}

async function fetchListPage(kind: FriendshipsListKind, cursor?: string, pageSize?: number): Promise<GraphPage> {
  try {
    const page = await fetchFriendshipsPage(kind, cursor, pageSize);
    const users = (page.users ?? []).map(rawToGraphUser);
    const hasMore = Boolean(page.next_max_id) && page.has_more !== false;
    return {
      users,
      nextCursor: page.next_max_id,
      hasMore,
    };
  } catch (e) {
    if (e instanceof InstagramApiError) {
      const retryable = e.status === 429 || /feedback_required|checkpoint|rate limit|please wait/i.test(e.message);
      throw new PlatformApiError(e.status, e.message, retryable);
    }
    throw e;
  }
}

export const instagramAdapter: SocialPlatformAdapter = {
  id: "instagram",
  networkLabel: "Instagram",
  documentTitle: "Socura — Instagram",
  storageKeyPrefix: INSTAGRAM_STORAGE_PREFIX,
  followersPageSafetyLimit: FOLLOWERS_PAGE_SAFETY_LIMIT,
  followingPageSafetyLimit: FOLLOWING_PAGE_SAFETY_LIMIT,
  hostGuardMessageKey: "hostGuardInstagramOnly",
  capabilities: { removeFollower: true },

  assertRuntime(): void {
    const viewer = getCookie("ds_user_id");
    if (!viewer) {
      throw new Error("Instagram session not found (ds_user_id)");
    }
  },

  getViewerId(): string | null {
    return getCookie("ds_user_id");
  },

  fetchFollowersPage(cursor?: string, pageSize?: number): Promise<GraphPage> {
    return fetchListPage("followers", cursor, pageSize);
  },

  fetchFollowingPage(cursor?: string, pageSize?: number): Promise<GraphPage> {
    return fetchListPage("following", cursor, pageSize);
  },

  graphUserToUserNode(user: GraphUser, followsViewer: boolean): UserNode {
    return rawFriendshipUserToUserNode(
      {
        pk: user.id,
        pk_id: user.id,
        username: user.username,
        full_name: user.displayName,
        profile_pic_url: user.profilePicUrl,
        is_private: user.isPrivate,
        is_verified: user.isVerified,
      },
      followsViewer,
    );
  },

  async unfollow(userId: string): Promise<UnfollowResult> {
    const csrftoken = getCookie("csrftoken");
    if (!csrftoken) {
      return { success: false, actionBlocked: false, httpStatus: 0, message: "csrftoken missing" };
    }
    const res = await fetch(unfollowUserUrlGenerator(userId), {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "x-csrftoken": csrftoken,
        "x-ig-app-id": INSTAGRAM_WEB_APP_ID,
        "x-asbd-id": INSTAGRAM_ASBD_ID,
        "x-requested-with": "XMLHttpRequest",
      },
      method: "POST",
      credentials: "same-origin",
    });
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    const message = String(data?.message ?? "");
    const actionBlocked =
      res.status === 429 ||
      res.status === 400 ||
      data?.status === "fail" ||
      data?.spam === true ||
      /feedback_required|checkpoint|action_blocked|block/i.test(message);
    const success = res.ok && data?.status !== "fail" && !actionBlocked;
    return { success, actionBlocked, httpStatus: res.status, message };
  },

  async removeFollower(userId: string): Promise<UnfollowResult> {
    const csrftoken = getCookie("csrftoken");
    if (!csrftoken) {
      return { success: false, actionBlocked: false, httpStatus: 0, message: "csrftoken missing" };
    }
    const res = await fetch(removeFollowerUserUrlGenerator(userId), {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "x-csrftoken": csrftoken,
        "x-ig-app-id": INSTAGRAM_WEB_APP_ID,
        "x-asbd-id": INSTAGRAM_ASBD_ID,
        "x-requested-with": "XMLHttpRequest",
      },
      method: "POST",
      credentials: "same-origin",
    });
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    const message = String(data?.message ?? "");
    const actionBlocked =
      res.status === 429 ||
      res.status === 400 ||
      data?.status === "fail" ||
      data?.spam === true ||
      /feedback_required|checkpoint|action_blocked|block/i.test(message);
    const success = res.ok && data?.status !== "fail" && !actionBlocked;
    return { success, actionBlocked, httpStatus: res.status, message };
  },

  isTransientFetchError(error: unknown): boolean {
    if (error instanceof PlatformApiError) {
      return error.retryable;
    }
    if (error instanceof InstagramApiError) {
      return error.status === 429 || /feedback_required|checkpoint|rate limit|please wait/i.test(error.message);
    }
    if (error instanceof TypeError) {
      return true;
    }
    const message = String((error as Error)?.message ?? "");
    return /fetch|network/i.test(message);
  },

  isActionBlockedUnfollow(result: UnfollowResult): boolean {
    return result.actionBlocked;
  },

  getDefaultTimings(): Timings {
    return {
      timeBetweenSearchCycles: DEFAULT_TIME_BETWEEN_SEARCH_CYCLES,
      timeToWaitAfterFiveSearchCycles: DEFAULT_TIME_TO_WAIT_AFTER_FIVE_SEARCH_CYCLES,
      timeBetweenUnfollows: DEFAULT_TIME_BETWEEN_UNFOLLOWS,
      timeToWaitAfterFiveUnfollows: DEFAULT_TIME_TO_WAIT_AFTER_FIVE_UNFOLLOWS,
      usersPerSearchCycle: DEFAULT_USERS_PER_SEARCH_CYCLE,
    };
  },
};
