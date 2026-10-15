import { GraphPage, GraphUser } from "../types";

export interface XListUser {
  id_str?: string;
  id?: number | string;
  screen_name?: string;
  name?: string;
  profile_image_url_https?: string;
  protected?: boolean;
  verified?: boolean;
}

export interface XListResponse {
  users?: XListUser[];
  next_cursor?: string;
  next_cursor_str?: string;
}

export function mapXListUser(raw: XListUser): GraphUser | null {
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

export function parseXListResponse(data: XListResponse): GraphPage {
  const users = (data.users ?? []).map(mapXListUser).filter((u): u is GraphUser => u !== null);
  const next = data.next_cursor_str ?? data.next_cursor ?? "0";
  const hasMore = Boolean(next && next !== "0");
  return { users, nextCursor: hasMore ? next : undefined, hasMore };
}
