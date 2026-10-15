import { INSTAGRAM_HOSTNAME } from "../constants/constants";
import { X_HOSTNAMES } from "../constants/x-constants";
import { instagramAdapter } from "./instagram/instagram-adapter";
import { previewInstagramAdapter, previewXAdapter } from "./preview-adapter";
import { SocialPlatformAdapter } from "./types";
import { xAdapter } from "./x/x-adapter";

export function resolveAdapter(
  hostname: string,
  isLocalPreview: boolean,
  previewPlatform: "instagram" | "x" | null,
): SocialPlatformAdapter | null {
  if (isLocalPreview) {
    return previewPlatform === "x" ? previewXAdapter : previewInstagramAdapter;
  }
  if (hostname === INSTAGRAM_HOSTNAME) {
    return instagramAdapter;
  }
  if (X_HOSTNAMES.has(hostname)) {
    return xAdapter;
  }
  return null;
}
