export type AuditMode = 'non_followers' | 'following_all' | 'followers_manage';

export type BulkQueueAction = 'unfollow' | 'remove_follower';

export function bulkActionForAuditMode(mode: AuditMode): BulkQueueAction {
  return mode === 'followers_manage' ? 'remove_follower' : 'unfollow';
}

export const DEFAULT_AUDIT_MODE: AuditMode = 'non_followers';
