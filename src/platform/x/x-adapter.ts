import { Typename, UserNode } from "../../model/user";
import { Timings } from "../../model/timings";
import {
  DEFAULT_TIME_BETWEEN_SEARCH_CYCLES,
  DEFAULT_TIME_BETWEEN_UNFOLLOWS,
  DEFAULT_TIME_TO_WAIT_AFTER_FIVE_SEARCH_CYCLES,
  DEFAULT_TIME_TO_WAIT_AFTER_FIVE_UNFOLLOWS,
  DEFAULT_USERS_PER_SEARCH_CYCLE,
} from "../../constants/constants";
import {
  FOLLOWERS_PAGE_SAFETY_LIMIT_X,
  FOLLOWING_PAGE_SAFETY_LIMIT_X,
  X_API_BASE,
  X_STORAGE_KEY_PREFIX,
  X_WEB_BEARER_TOKEN,
} from "../../constants/x-constants";
import { getCookie } from "../../utils/utils";
import { GraphPage, GraphUser, PlatformApiError, SocialPlatformAdapter, UnfollowResult } from "../types";

interface XListUser {
  id_str?: string;
  id?: number | string;
  screen_name?: string;
  name?: string;
  profile_image_url_https?: string;
  protected?: boolean;
  verified?: boolean;
}

interface XListResponse {
  users?: XListUser[];
  next_cursor?: string;
  next_cursor_str?: string;
}

function parseViewerIdFromTwid(): string | null {
  const twid = getCookie("twid");
  if (!twid) {
    return null;
  }
  try {
    const decoded = decodeURIComponent(twid);
    const match = decoded.match(/(\d{5,})/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function xHeaders(): Record<string, string> {
  const ct0 = getCookie("ct0") ?? "";
  return {
    authorization: `Bearer ${X_WEB_BEARER_TOKEN}`,
    "x-csrf-token": ct0,
    "x-twitter-auth-type": "OAuth2Session",
    "x-twitter-active-user": "yes",
    "content-type": "application/json",
  };
}

function mapXUser(raw: XListUser): GraphUser | null {
  const id = raw.id_str ?? (raw.id !== undefined ? String(raw.id) : "");
  const username = raw.screen_name ?? "";
  if (!id || !username) {
    return null;
  }
  return {
    id,
    username,
    displayName: raw.name ?? username,
    profilePicUrl: raw.profile_image_url_https ?? "",
    isPrivate: raw.protected ?? false,
    isVerified: raw.verified ?? false,
  };
}

async function fetchXList(kind: "followers" | "friends", cursor?: string, pageSize = 50): Promise<GraphPage> {
  const viewerId = parseViewerIdFromTwid();
  if (!viewerId) {
    throw new PlatformApiError(401, "X session not found", false);
  }
  const path = kind === "followers" ? "followers/list.json" : "friends/list.json";
  const params = new URLSearchParams({
    user_id: viewerId,
    count: String(pageSize),
    skip_status: "true",
    include_user_entities: "false",
  });
  if (cursor && cursor !== "0") {
    params.set("cursor", cursor);
  }
  const response = await fetch(`${X_API_BASE}/${path}?${params.toString()}`, {
    credentials: "include",
    headers: xHeaders(),
  });
  if (!response.ok) {
    const retryable = response.status === 429 || response.status >= 500;
    throw new PlatformApiError(response.status, `X returned HTTP ${response.status} for ${kind}`, retryable);
  }
  const data = (await response.json()) as XListResponse;
  const users = (data.users ?? []).map(mapXUser).filter((u): u is GraphUser => u !== null);
  const next = data.next_cursor_str ?? data.next_cursor ?? "0";
  const hasMore = Boolean(next && next !== "0");
  return { users, nextCursor: hasMore ? next : undefined, hasMore };
}

export const xAdapter: SocialPlatformAdapter = {
  id: "x",
  networkLabel: "X",
  documentTitle: "Social Unfollowers — X",
  storageKeyPrefix: X_STORAGE_KEY_PREFIX,
  followersPageSafetyLimit: FOLLOWERS_PAGE_SAFETY_LIMIT_X,
  followingPageSafetyLimit: FOLLOWING_PAGE_SAFETY_LIMIT_X,
  hostGuardMessageKey: "hostGuardXOnly",

  assertRuntime(): void {
    if (!getCookie("auth_token") || !getCookie("ct0")) {
      throw new Error("X session not found (auth_token / ct0)");
    }
  },

  getViewerId(): string | null {
    return parseViewerIdFromTwid();
  },

  fetchFollowersPage(cursor?: string, pageSize?: number): Promise<GraphPage> {
    return fetchXList("followers", cursor, pageSize);
  },

  fetchFollowingPage(cursor?: string, pageSize?: number): Promise<GraphPage> {
    return fetchXList("friends", cursor, pageSize);
  },

  graphUserToUserNode(user: GraphUser, followsViewer: boolean): UserNode {
    const avatar = user.profilePicUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.username)}`;
    return {
      id: user.id,
      username: user.username,
      full_name: user.displayName,
      profile_pic_url: avatar,
      is_private: user.isPrivate,
      is_verified: user.isVerified,
      followed_by_viewer: true,
      requested_by_viewer: false,
      follows_viewer: followsViewer,
      reel: {
        id: user.id,
        expiring_at: 0,
        has_pride_media: false,
        latest_reel_media: 0,
        seen: null,
        owner: {
          __typename: Typename.GraphUser,
          id: user.id,
          profile_pic_url: avatar,
          username: user.username,
        },
      },
    };
  },

  async unfollow(userId: string): Promise<UnfollowResult> {
    const ct0 = getCookie("ct0");
    if (!ct0) {
      return { success: false, actionBlocked: false, httpStatus: 0, message: "ct0 missing" };
    }
    const body = new URLSearchParams({ user_id: userId });
    const res = await fetch(`${X_API_BASE}/friendships/destroy.json`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...xHeaders(),
        "content-type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    const errors = data?.errors;
    const actionBlocked = res.status === 403 || res.status === 429 || Boolean(errors);
    const success = res.ok && !errors;
    return {
      success,
      actionBlocked,
      httpStatus: res.status,
      message: Array.isArray(errors) ? JSON.stringify(errors) : undefined,
    };
  },

  isTransientFetchError(error: unknown): boolean {
    if (error instanceof PlatformApiError) {
      return error.retryable;
    }
    if (error instanceof TypeError) {
      return true;
    }
    return /fetch|network/i.test(String((error as Error)?.message ?? ""));
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
