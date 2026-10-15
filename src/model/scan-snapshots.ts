import { AuditMode } from './audit-mode';
import { UserNode } from './user';

export type ResultsLens = AuditMode;

export interface ScanSnapshots {
  readonly nonFollowers: readonly UserNode[];
  readonly followingAll: readonly UserNode[];
  readonly followersAll: readonly UserNode[];
}

export const EMPTY_SCAN_SNAPSHOTS: ScanSnapshots = {
  nonFollowers: [],
  followingAll: [],
  followersAll: [],
};

export function listForLens(snapshots: ScanSnapshots, lens: ResultsLens): readonly UserNode[] {
  switch (lens) {
    case 'non_followers':
      return snapshots.nonFollowers;
    case 'following_all':
      return snapshots.followingAll;
    case 'followers_manage':
      return snapshots.followersAll;
    default:
      return snapshots.nonFollowers;
  }
}

export function buildPreviewSnapshots(users: readonly UserNode[]): ScanSnapshots {
  const followingAll = [...users];
  const nonFollowers = users.filter(u => !u.follows_viewer);
  const followersAll = users.filter(u => u.follows_viewer);
  return {
    nonFollowers,
    followingAll,
    followersAll: followersAll.length > 0 ? followersAll : users.slice(0, 3),
  };
}

export function resultsForLens(snapshots: ScanSnapshots, lens: ResultsLens): readonly UserNode[] {
  return [...listForLens(snapshots, lens)];
}
