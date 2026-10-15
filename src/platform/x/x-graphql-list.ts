import {
  X_GRAPHQL_BASE,
  X_GRAPHQL_FOLLOWERS_QUERY_ID,
  X_GRAPHQL_FOLLOWING_QUERY_ID,
} from '../../constants/x-constants';
import { GraphPage, GraphUser, PlatformApiError } from '../types';
import { buildXApiHeaders, resolveXViewerId } from './x-http';
import { mapXListUser, XListUser } from './x-list-parse';

/* eslint-disable @typescript-eslint/no-unnecessary-condition -- GraphQL JSON em runtime é parcialmente tipado */
const GRAPHQL_FOLLOWERS_OP = 'Followers';
const GRAPHQL_FOLLOWING_OP = 'Following';

function graphqlQueryId(kind: 'followers' | 'friends'): string {
  const overrideKey =
    kind === 'followers' ? 'iu_x_graphql_followers_query_id' : 'iu_x_graphql_following_query_id';
  try {
    const stored = localStorage.getItem(overrideKey);
    if (stored?.trim()) {
      return stored.trim();
    }
  } catch {
    // ignore
  }
  return kind === 'followers' ? X_GRAPHQL_FOLLOWERS_QUERY_ID : X_GRAPHQL_FOLLOWING_QUERY_ID;
}

type GraphqlJson = Record<string, unknown>;

function extractInstructions(data: GraphqlJson): unknown[] {
  const paths = [
    data?.data,
    (data?.data as GraphqlJson)?.user,
    ((data?.data as GraphqlJson)?.user as GraphqlJson)?.result,
    (((data?.data as GraphqlJson)?.user as GraphqlJson)?.result as GraphqlJson)?.timeline,
    ((((data?.data as GraphqlJson)?.user as GraphqlJson)?.result as GraphqlJson)?.timeline as GraphqlJson)
      ?.timeline,
    (
      (
        ((data?.data as GraphqlJson)?.user as GraphqlJson)?.result as GraphqlJson
      )?.timeline as GraphqlJson
    )?.timeline,
  ];
  let node: unknown = data;
  for (const key of ['data', 'user', 'result', 'timeline', 'timeline']) {
    if (node && typeof node === 'object' && key in (node as GraphqlJson)) {
      node = (node as GraphqlJson)[key];
    }
  }
  const instructions =
    (node as GraphqlJson)?.instructions ??
    (paths[paths.length - 1] as GraphqlJson)?.instructions ??
    [];
  return Array.isArray(instructions) ? instructions : [];
}

function usersFromGraphql(data: GraphqlJson): GraphUser[] {
  const users: GraphUser[] = [];
  for (const instruction of extractInstructions(data)) {
    const entries = (instruction as GraphqlJson)?.entries;
    if (!Array.isArray(entries)) {
      continue;
    }
    for (const entry of entries) {
      const content = (entry as GraphqlJson)?.content as GraphqlJson | undefined;
      const legacy = (content?.itemContent as GraphqlJson)?.user_results as GraphqlJson | undefined;
      const result = legacy?.result as GraphqlJson | undefined;
      const legacyUser = result?.legacy as XListUser | undefined;
      const restId = result?.rest_id as string | undefined;
      if (!legacyUser) {
        continue;
      }
      const withId = restId ? { ...legacyUser, id_str: legacyUser.id_str ?? restId } : legacyUser;
      const mapped = mapXListUser(withId);
      if (mapped) {
        users.push(mapped);
      }
    }
  }
  return users;
}

function cursorFromGraphql(data: GraphqlJson): string | undefined {
  for (const instruction of extractInstructions(data)) {
    const entries = (instruction as GraphqlJson)?.entries;
    if (!Array.isArray(entries)) {
      continue;
    }
    for (const entry of entries) {
      const entryId = String((entry as GraphqlJson)?.entryId ?? '');
      if (!entryId.includes('cursor-bottom')) {
        continue;
      }
      const value = String(((entry as GraphqlJson)?.content as GraphqlJson)?.value ?? '');
      if (value) {
        return value;
      }
    }
  }
  return undefined;
}

export async function fetchXListGraphQL(
  kind: 'followers' | 'friends',
  cursor?: string,
  pageSize = 50,
): Promise<GraphPage> {
  const viewerId = await resolveXViewerId();
  if (!viewerId) {
    throw new PlatformApiError(401, 'X session not found', false, 'session');
  }
  const operation = kind === 'followers' ? GRAPHQL_FOLLOWERS_OP : GRAPHQL_FOLLOWING_OP;
  const queryId = graphqlQueryId(kind);
  const variables = {
    userId: viewerId,
    count: pageSize,
    includePromotedContent: false,
    ...(cursor ? { cursor } : {}),
  };
  const params = new URLSearchParams({
    variables: JSON.stringify(variables),
  });
  const url = `${X_GRAPHQL_BASE}/${queryId}/${operation}?${params.toString()}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: buildXApiHeaders('get'),
  });
  if (!res.ok) {
    const retryable = res.status === 429 || res.status >= 500;
    const kindError =
      res.status === 401 || res.status === 403
        ? 'session'
        : res.status === 429
          ? 'rate_limit'
          : 'api';
    throw new PlatformApiError(
      res.status,
      `X GraphQL HTTP ${res.status} for ${kind}`,
      retryable,
      kindError,
    );
  }
  const data = (await res.json()) as GraphqlJson;
  const users = usersFromGraphql(data);
  const next = cursorFromGraphql(data);
  const hasMore = Boolean(next);
  return { users, nextCursor: hasMore ? next : undefined, hasMore };
}
