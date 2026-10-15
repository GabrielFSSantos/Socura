import { GraphUser } from './types';

export interface GraphUserIndex {
  readonly ids: Set<string>;
  readonly usernames: Set<string>;
}

export function createGraphUserIndex(): GraphUserIndex {
  return {
    ids: new Set<string>(),
    usernames: new Set<string>(),
  };
}

export function addGraphUserToIndex(index: GraphUserIndex, user: GraphUser): void {
  const id = user.id.trim();
  if (id) {
    index.ids.add(id);
  }
  const username = user.username.trim().toLowerCase();
  if (username) {
    index.usernames.add(username);
  }
}

export function isGraphUserInIndex(
  index: { readonly ids: ReadonlySet<string>; readonly usernames: ReadonlySet<string> },
  user: GraphUser,
): boolean {
  const id = user.id.trim();
  if (id && index.ids.has(id)) {
    return true;
  }
  const username = user.username.trim().toLowerCase();
  return Boolean(username && index.usernames.has(username));
}
