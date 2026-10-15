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
  X_STORAGE_KEY_PREFIX,
} from "../../constants/x-constants";
import { GraphPage, GraphUser, PlatformApiError, SocialPlatformAdapter, UnfollowResult } from "../types";
import { fetchXListGraphQL } from "./x-graphql-list";
import {
  fetchXApiJson,
  hasXSessionCookies,
  parseViewerIdFromTwidCookie,
  resolveXViewerId,
} from "./x-http";
import { parseXListResponse, XListResponse } from "./x-list-parse";

async function fetchXListRest(
  kind: "followers" | "friends",
  cursor?: string,
  pageSize = 50,
): Promise<GraphPage> {
  const viewerId = await resolveXViewerId();
  if (!viewerId) {
    throw new PlatformApiError(401, "X session not found", false, "session");
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
  const response = await fetchXApiJson(`${path}?${params.toString()}`);
  if (!response.ok) {
    const retryable = response.status === 429 || response.status >= 500;
    const kindError = response.status === 401 || response.status === 403 ? "session" : "api";
    throw new PlatformApiError(
      response.status,
      `X returned HTTP ${response.status} for ${kind}`,
      retryable,
      response.status === 429 ? "rate_limit" : kindError,
    );
  }
  const data = (await response.json()) as XListResponse;
  return parseXListResponse(data);
}

async function fetchXList(kind: "followers" | "friends", cursor?: string, pageSize = 50): Promise<GraphPage> {
  try {
    return await fetchXListRest(kind, cursor, pageSize);
  } catch (e) {
    if (e instanceof PlatformApiError && (e.status === 401 || e.status === 403)) {
      try {
        return await fetchXListGraphQL(kind, cursor, pageSize);
      } catch (graphqlError) {
        console.warn("X GraphQL fallback failed:", graphqlError);
        throw e;
      }
    }
    throw e;
  }
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
    if (!hasXSessionCookies()) {
      console.warn(
        "Social Unfollowers: cookie ct0/twid não visível no JS; se o scan falhar, recarregue x.com e tente de novo.",
      );
    }
  },

  getViewerId(): string | null {
    return parseViewerIdFromTwidCookie();
  },

  fetchFollowersPage(cursor?: string, pageSize?: number): Promise<GraphPage> {
    return fetchXList("followers", cursor, pageSize);
  },

  fetchFollowingPage(cursor?: string, pageSize?: number): Promise<GraphPage> {
    return fetchXList("friends", cursor, pageSize);
  },

  graphUserToUserNode(user: GraphUser, followsViewer: boolean): UserNode {
    const avatar =
      user.profilePicUrl ||
      `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.username)}`;
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
    const response = await fetchXApiJson("friendships/destroy.json", {
      method: "POST",
      headerKind: "postForm",
      body: new URLSearchParams({ user_id: userId }).toString(),
    });
    const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    const errors = data?.errors;
    const actionBlocked = response.status === 403 || response.status === 429 || Boolean(errors);
    const success = response.ok && !errors;
    return {
      success,
      actionBlocked,
      httpStatus: response.status,
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
