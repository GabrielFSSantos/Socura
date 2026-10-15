import { instagramAdapter } from "./instagram/instagram-adapter";
import { SocialPlatformAdapter } from "./types";

/** Preview local — mesma superfície que Instagram; scan real não usa API. */
export const previewInstagramAdapter: SocialPlatformAdapter = {
  ...instagramAdapter,
  id: "preview",
  networkLabel: "Instagram",
  documentTitle: "Social Unfollowers — preview",
  hostGuardMessageKey: "hostGuardInstagramOnly",
  assertRuntime(): void {
    // no-op for local preview
  },
  getViewerId(): string | null {
    return "preview-viewer";
  },
};

export const previewXAdapter: SocialPlatformAdapter = {
  ...previewInstagramAdapter,
  networkLabel: "X",
  documentTitle: "Social Unfollowers — preview (X)",
  hostGuardMessageKey: "hostGuardXOnly",
};
