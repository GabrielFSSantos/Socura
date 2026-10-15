import { X_API_BASE, X_WEB_BEARER_TOKEN } from "../../constants/x-constants";
import { getCookie } from "../../utils/utils";
import { PlatformApiError } from "../types";

let cachedViewerId: string | null | undefined;
let cachedBearer: string | undefined;

export function parseViewerIdFromTwidCookie(twid?: string | null): string | null {
  const raw = twid ?? getCookie("twid");
  if (!raw) {
    return null;
  }
  try {
    const decoded = decodeURIComponent(raw);
    const match = decoded.match(/u[=:](\d{5,})/i) ?? decoded.match(/(\d{10,})/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/** Tenta obter o bearer público que o cliente web do X usa na página atual. */
export function resolveXBearerToken(): string {
  if (cachedBearer) {
    return cachedBearer;
  }
  const html = document.documentElement?.innerHTML ?? "";
  const bearerMatch = html.match(/Bearer\s+(AAAAAAAAAAAAAAAAAAAAA[A-Za-z0-9%]+)/);
  if (bearerMatch?.[1]) {
    cachedBearer = bearerMatch[1];
    return cachedBearer;
  }
  for (const key of Object.keys(localStorage)) {
    try {
      const value = localStorage.getItem(key) ?? "";
      const m = value.match(/(AAAAAAAAAAAAAAAAAAAAA[A-Za-z0-9%]{20,})/);
      if (m?.[1]) {
        cachedBearer = m[1];
        return cachedBearer;
      }
    } catch {
      // ignore
    }
  }
  cachedBearer = X_WEB_BEARER_TOKEN;
  return cachedBearer;
}

export function resetXHttpSessionCache(): void {
  cachedViewerId = undefined;
  cachedBearer = undefined;
}

export type XApiHeaderKind = "get" | "postForm";

export function buildXApiHeaders(kind: XApiHeaderKind): Record<string, string> {
  const ct0 = getCookie("ct0") ?? "";
  const bearer = resolveXBearerToken();
  const lang =
    typeof navigator !== "undefined" && navigator.language ? navigator.language : "pt-BR";
  const headers: Record<string, string> = {
    authorization: `Bearer ${bearer}`,
    "x-csrf-token": ct0,
    "x-twitter-auth-type": "OAuth2Session",
    "x-twitter-active-user": "yes",
    accept: "*/*",
    "accept-language": lang,
    referer: "https://x.com/",
    origin: "https://x.com",
  };
  if (kind === "postForm") {
    headers["content-type"] = "application/x-www-form-urlencoded";
  }
  return headers;
}

export function hasXSessionCookies(): boolean {
  return Boolean(getCookie("auth_token") && getCookie("ct0"));
}

export async function fetchXApiJson(
  path: string,
  init: RequestInit & { headerKind?: XApiHeaderKind } = {},
): Promise<Response> {
  const headerKind = init.headerKind ?? (init.method === "POST" ? "postForm" : "get");
  const { headerKind: _drop, ...rest } = init;
  const url = path.startsWith("http") ? path : `${X_API_BASE}/${path.replace(/^\//, "")}`;
  return fetch(url, {
    credentials: "include",
    ...rest,
    headers: {
      ...buildXApiHeaders(headerKind),
      ...(rest.headers as Record<string, string> | undefined),
    },
  });
}

export async function resolveXViewerId(): Promise<string | null> {
  if (cachedViewerId !== undefined) {
    return cachedViewerId;
  }
  const fromTwid = parseViewerIdFromTwidCookie();
  if (fromTwid) {
    cachedViewerId = fromTwid;
    return fromTwid;
  }
  if (!hasXSessionCookies()) {
    cachedViewerId = null;
    return null;
  }
  const res = await fetchXApiJson("account/verify_credentials.json?skip_status=true");
  if (!res.ok) {
    cachedViewerId = null;
    return null;
  }
  const data = (await res.json()) as { id_str?: string; id?: number | string };
  const id = data.id_str ?? (data.id !== undefined ? String(data.id) : null);
  cachedViewerId = id;
  return id;
}

export async function assertXSession(): Promise<void> {
  if (!hasXSessionCookies()) {
    throw new PlatformApiError(401, "X session cookies missing", false, "session");
  }
  const viewerId = await resolveXViewerId();
  if (!viewerId) {
    throw new PlatformApiError(401, "X viewer id not found", false, "session");
  }
  const probe = await fetchXApiJson("account/verify_credentials.json?skip_status=true");
  if (!probe.ok) {
    throw new PlatformApiError(probe.status, `X session probe HTTP ${probe.status}`, false, "api");
  }
}
