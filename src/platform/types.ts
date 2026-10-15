import { UserNode } from "../model/user";
import { Timings } from "../model/timings";
import type { TranslationKey } from "../utils/i18n";

export type PlatformId = "instagram" | "x" | "preview";

export interface GraphUser {
  readonly id: string;
  readonly username: string;
  readonly displayName: string;
  readonly profilePicUrl: string;
  readonly isPrivate: boolean;
  readonly isVerified: boolean;
}

export interface GraphPage {
  readonly users: readonly GraphUser[];
  readonly nextCursor?: string;
  readonly hasMore: boolean;
}

export interface UnfollowResult {
  readonly success: boolean;
  readonly actionBlocked: boolean;
  readonly httpStatus: number;
  readonly message?: string;
}

export class PlatformApiError extends Error {
  readonly status: number;
  readonly retryable: boolean;

  constructor(status: number, message: string, retryable = false) {
    super(message);
    this.name = "PlatformApiError";
    this.status = status;
    this.retryable = retryable;
    Object.setPrototypeOf(this, PlatformApiError.prototype);
  }
}

export interface SocialPlatformAdapter {
  readonly id: PlatformId;
  readonly networkLabel: string;
  readonly documentTitle: string;
  readonly storageKeyPrefix: string;
  readonly followersPageSafetyLimit: number;
  readonly followingPageSafetyLimit: number;
  readonly hostGuardMessageKey: TranslationKey;

  assertRuntime(): void;
  getViewerId(): string | null;
  fetchFollowersPage(cursor?: string, pageSize?: number): Promise<GraphPage>;
  fetchFollowingPage(cursor?: string, pageSize?: number): Promise<GraphPage>;
  graphUserToUserNode(user: GraphUser, followsViewer: boolean): UserNode;
  unfollow(userId: string): Promise<UnfollowResult>;
  isTransientFetchError(error: unknown): boolean;
  isActionBlockedUnfollow(result: UnfollowResult): boolean;
  getDefaultTimings(): Timings;
}
