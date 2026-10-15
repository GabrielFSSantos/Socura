export interface ScanningFilter {
  readonly showVerified: boolean;
  readonly showPrivate: boolean;
  readonly showWithOutProfilePicture: boolean;
  readonly showFollowsViewer: boolean;
  readonly showNotFollowsViewer: boolean;
}

export const DEFAULT_SCANNING_FILTER: ScanningFilter = {
  showVerified: true,
  showPrivate: true,
  showWithOutProfilePicture: true,
  showFollowsViewer: true,
  showNotFollowsViewer: true,
};
