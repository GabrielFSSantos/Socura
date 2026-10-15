import { listForLens, buildPreviewSnapshots } from '../src/model/scan-snapshots';
import { Typename, UserNode } from '../src/model/user';
import { getUsersForDisplay } from '../src/utils/utils';
import { DEFAULT_SCANNING_FILTER } from '../src/model/scanning-filter';

const mockUser = (id: string, followsViewer: boolean): UserNode => ({
  id,
  username: `user_${id}`,
  full_name: `User ${id}`,
  profile_pic_url: 'https://example.com/pic.jpg',
  is_private: false,
  is_verified: false,
  followed_by_viewer: true,
  follows_viewer: followsViewer,
  requested_by_viewer: false,
  reel: {
    id,
    expiring_at: 0,
    has_pride_media: false,
    latest_reel_media: 0,
    seen: null,
    owner: {
      __typename: Typename.GraphUser,
      id,
      profile_pic_url: 'https://example.com/pic.jpg',
      username: `user_${id}`,
    },
  },
});

const snapshots = {
  nonFollowers: [mockUser('1', false)],
  followingAll: [mockUser('1', false), mockUser('2', true)],
  followersAll: [mockUser('2', true)],
};

if (listForLens(snapshots, 'non_followers').length !== 1) {
  throw new Error('listForLens non_followers failed');
}

const followingFiltered = getUsersForDisplay(
  listForLens(snapshots, 'following_all'),
  [],
  'non_whitelisted',
  '',
  { ...DEFAULT_SCANNING_FILTER, showFollowsViewer: false, showNotFollowsViewer: true },
  'following_all',
);
if (followingFiltered.length !== 1 || followingFiltered[0].id !== '1') {
  throw new Error('relationship filter failed');
}

const preview = buildPreviewSnapshots([mockUser('a', false), mockUser('b', true)]);
if (preview.followingAll.length !== 2) {
  throw new Error('buildPreviewSnapshots failed');
}

console.log('test-scan-snapshots: OK');
