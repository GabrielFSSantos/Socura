import { X_API_BASE, X_WEB_BEARER_TOKEN } from "../../constants/x-constants";
import { getCookie } from "../../utils/utils";
import { PlatformApiError } from "../types";

export const X_CACHED_BEARER_SESSION_KEY = "iu_x_cached_bearer";
export const X_API_HEADER_MIRROR_KEY = "iu_x_api_header_mirror";
export const X_API_HEADER_MIRROR_AT_KEY = "iu_x_api_header_mirror_at";
const MIRROR_TX_MAX_AGE_MS = 90_000;

const CLIENT_UUID_STORAGE_KEY = "iu_x_client_uuid";
const BEARER_PATTERN = /Bearer\s+(AAAAAAAAAAAAAAAAAAAAA[A-Za-z0-9%]+)/;
const BEARER_INLINE_PATTERN = /(AAAAAAAAAAAAAAAAAAAAA[A-Za-z0-9%]{20,})/;

const MIRROR_HEADER_ALLOWLIST = new Set([
  "authorization",
  "x-csrf-token",
  "x-client-transaction-id",
  "x-client-uuid",
  "x-twitter-client-language",
  "x-twitter-auth-type",
  "x-twitter-active-user",
]);

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

/** Normaliza ct0 para o header x-csrf-token (valor em document.cookie pode estar encoded). */
export function normalizeXCsrfToken(ct0Raw: string): string {
  if (!ct0Raw) {
    return "";
  }
  try {
    return decodeURIComponent(ct0Raw);
  } catch {
    return ct0Raw;
  }
}

/** Extrai bearer do HTML/scripts (testável sem DOM completo). */
export function extractBearerFromText(text: string): string | null {
  const bearerMatch = text.match(BEARER_PATTERN);
  if (bearerMatch?.[1]) {
    return bearerMatch[1];
  }
  const inline = text.match(BEARER_INLINE_PATTERN);
  return inline?.[1] ?? null;
}

/** Filtra headers capturados de uma requisição real do cliente X. */
export function captureMirroredHeadersFromRequestHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    const lower = key.toLowerCase();
    if (MIRROR_HEADER_ALLOWLIST.has(lower) && value) {
      out[lower] = value;
    }
  }
  return out;
}

export function loadMirroredApiHeaders(): Record<string, string> {
  if (typeof localStorage === "undefined") {
    return {};
  }
  try {
    const raw = localStorage.getItem(X_API_HEADER_MIRROR_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as Record<string, string>;
    return captureMirroredHeadersFromRequestHeaders(parsed);
  } catch {
    return {};
  }
}

export function persistMirroredApiHeaders(headers: Record<string, string>): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  const filtered = captureMirroredHeadersFromRequestHeaders(headers);
  if (Object.keys(filtered).length === 0) {
    return;
  }
  try {
    const merged = { ...loadMirroredApiHeaders(), ...filtered };
    localStorage.setItem(X_API_HEADER_MIRROR_KEY, JSON.stringify(merged));
    localStorage.setItem(X_API_HEADER_MIRROR_AT_KEY, String(Date.now()));
  } catch {
    // ignore quota
  }
}

export function hasMinimalXApiMirror(): boolean {
  const mirror = loadMirroredApiHeaders();
  return Boolean(mirror.authorization && mirror["x-csrf-token"]);
}

export async function waitForXApiMirror(timeoutMs = 20_000): Promise<boolean> {
  if (hasMinimalXApiMirror()) {
    return true;
  }
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (hasMinimalXApiMirror()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  return hasMinimalXApiMirror();
}

function clearMirroredTransactionId(): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  try {
    const mirror = loadMirroredApiHeaders();
    if (!mirror["x-client-transaction-id"]) {
      return;
    }
    const { "x-client-transaction-id": _drop, ...rest } = mirror;
    localStorage.setItem(X_API_HEADER_MIRROR_KEY, JSON.stringify(rest));
  } catch {
    /* ignore */
  }
}

export function persistXBearerFromPage(): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  const fromPage = readBearerFromDom();
  if (fromPage && fromPage !== X_WEB_BEARER_TOKEN) {
    try {
      sessionStorage.setItem(X_CACHED_BEARER_SESSION_KEY, fromPage);
    } catch {
      // ignore
    }
  }
}

let xApiHeaderCaptureInstalled = false;

function captureFromApiUrl(url: string, headers: Record<string, string>): void {
  if (url.includes("/i/api/")) {
    persistMirroredApiHeaders(headers);
  }
}

function installXhrHeaderCapture(): void {
  if (typeof XMLHttpRequest === "undefined") {
    return;
  }
  const proto = XMLHttpRequest.prototype;
  const nativeOpen = proto.open;
  const nativeSetHeader = proto.setRequestHeader;
  const nativeSend = proto.send;

  proto.open = function (
    method: string,
    url: string | URL,
    async?: boolean,
    username?: string | null,
    password?: string | null,
  ) {
    (this as XMLHttpRequest & { _iuUrl?: string; _iuHeaders?: Record<string, string> })._iuUrl =
      String(url);
    (this as XMLHttpRequest & { _iuHeaders?: Record<string, string> })._iuHeaders = {};
    return nativeOpen.call(this, method, url, async ?? true, username, password);
  };

  proto.setRequestHeader = function (name: string, value: string) {
    const bag = (this as XMLHttpRequest & { _iuHeaders?: Record<string, string> })._iuHeaders;
    if (bag) {
      bag[name.toLowerCase()] = value;
    }
    return nativeSetHeader.call(this, name, value);
  };

  proto.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
    const url = (this as XMLHttpRequest & { _iuUrl?: string })._iuUrl ?? "";
    const bag = (this as XMLHttpRequest & { _iuHeaders?: Record<string, string> })._iuHeaders;
    if (bag) {
      captureFromApiUrl(url, bag);
    }
    return nativeSend.call(this, body);
  };
}

/** Espelha headers das requisições /i/api/ da própria SPA do X (fetch + XHR). */
export function installXApiHeaderCapture(): void {
  if (xApiHeaderCaptureInstalled || typeof window === "undefined") {
    return;
  }
  const nativeFetch = window.fetch?.bind(window);
  if (!nativeFetch) {
    return;
  }
  xApiHeaderCaptureInstalled = true;
  installXhrHeaderCapture();

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input instanceof Request
              ? input.url
              : "";
      if (url.includes("/i/api/")) {
        const merged: Record<string, string> = {};
        if (input instanceof Request) {
          input.headers.forEach((v, k) => {
            merged[k] = v;
          });
        }
        if (init?.headers) {
          const h = new Headers(init.headers as HeadersInit);
          h.forEach((v, k) => {
            merged[k] = v;
          });
        }
        captureFromApiUrl(url, merged);
      }
    } catch {
      /* ignore */
    }
    return nativeFetch(input, init);
  }) as typeof fetch;
}

function readBearerFromDom(): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const fromRoot = extractBearerFromText(document.documentElement?.innerHTML ?? "");
  if (fromRoot) {
    return fromRoot;
  }
  for (const script of document.querySelectorAll("script")) {
    const fromScript = extractBearerFromText(script.textContent ?? "");
    if (fromScript) {
      return fromScript;
    }
  }
  if (typeof localStorage !== "undefined") {
    for (const key of Object.keys(localStorage)) {
      try {
        const value = localStorage.getItem(key) ?? "";
        const m = value.match(BEARER_INLINE_PATTERN);
        if (m?.[1]) {
          return m[1];
        }
      } catch {
        // ignore
      }
    }
  }
  return null;
}

function readCachedBearerFromSession(): string | null {
  if (typeof sessionStorage === "undefined") {
    return null;
  }
  try {
    const v = sessionStorage.getItem(X_CACHED_BEARER_SESSION_KEY);
    return v && v !== X_WEB_BEARER_TOKEN ? v : null;
  } catch {
    return null;
  }
}

function resolveClientUuid(): string {
  const mirror = loadMirroredApiHeaders();
  if (mirror["x-client-uuid"]) {
    return mirror["x-client-uuid"];
  }
  if (typeof sessionStorage === "undefined") {
    return "00000000-0000-4000-8000-000000000000";
  }
  try {
    let id = sessionStorage.getItem(CLIENT_UUID_STORAGE_KEY);
    if (!id && typeof crypto !== "undefined" && crypto.randomUUID) {
      id = crypto.randomUUID();
      sessionStorage.setItem(CLIENT_UUID_STORAGE_KEY, id);
    }
    return id ?? "00000000-0000-4000-8000-000000000000";
  } catch {
    return "00000000-0000-4000-8000-000000000000";
  }
}

/** Tenta obter o bearer público que o cliente web do X usa na página atual. */
export function resolveXBearerToken(): string {
  if (cachedBearer) {
    return cachedBearer;
  }
  const fromSession = readCachedBearerFromSession();
  if (fromSession) {
    cachedBearer = fromSession;
    return fromSession;
  }
  const fromPage = readBearerFromDom();
  if (fromPage) {
    cachedBearer = fromPage;
    return fromPage;
  }
  const mirror = loadMirroredApiHeaders();
  if (mirror.authorization?.startsWith("Bearer ")) {
    const token = mirror.authorization.slice("Bearer ".length);
    if (token && token !== X_WEB_BEARER_TOKEN) {
      cachedBearer = token;
      return token;
    }
  }
  return X_WEB_BEARER_TOKEN;
}

export function resetXHttpSessionCache(): void {
  cachedViewerId = undefined;
  cachedBearer = undefined;
}

export type XApiHeaderKind = "get" | "postForm";

export function buildXApiHeaders(kind: XApiHeaderKind): Record<string, string> {
  const mirror = loadMirroredApiHeaders();
  const ct0 = mirror["x-csrf-token"] ?? normalizeXCsrfToken(getCookie("ct0") ?? "");
  const bearer = resolveXBearerToken();
  const lang =
    mirror["x-twitter-client-language"] ??
    (typeof navigator !== "undefined" && navigator.language ? navigator.language : "pt-BR");
  const headers: Record<string, string> = {
    authorization: mirror.authorization ?? `Bearer ${bearer}`,
    "x-csrf-token": ct0,
    "x-twitter-auth-type": mirror["x-twitter-auth-type"] ?? "OAuth2Session",
    "x-twitter-active-user": mirror["x-twitter-active-user"] ?? "yes",
    "x-twitter-client-language": lang,
    "x-client-uuid": resolveClientUuid(),
    accept: "*/*",
    "accept-language": lang,
    referer: "https://x.com/",
    origin: "https://x.com",
  };
  let mirrorAge = Number.POSITIVE_INFINITY;
  if (typeof localStorage !== "undefined") {
    try {
      const at = Number(localStorage.getItem(X_API_HEADER_MIRROR_AT_KEY) ?? "0");
      if (at > 0) {
        mirrorAge = Date.now() - at;
      }
    } catch {
      /* ignore */
    }
  }
  if (mirror["x-client-transaction-id"] && mirrorAge < MIRROR_TX_MAX_AGE_MS) {
    headers["x-client-transaction-id"] = mirror["x-client-transaction-id"];
  }
  if (kind === "postForm") {
    headers["content-type"] = "application/x-www-form-urlencoded";
  }
  return headers;
}

/**
 * Indícios de sessão legíveis no JS. `auth_token` é HttpOnly e não entra em document.cookie,
 * mas ainda é enviado em fetch com credentials:include.
 */
export function hasXSessionCookies(): boolean {
  if (getCookie("ct0")) {
    return true;
  }
  if (getCookie("twid")) {
    return true;
  }
  return Boolean(getCookie("auth_token"));
}

export async function fetchXApiJson(
  path: string,
  init: RequestInit & { headerKind?: XApiHeaderKind } = {},
): Promise<Response> {
  const headerKind = init.headerKind ?? (init.method === "POST" ? "postForm" : "get");
  const { headerKind: _drop, ...rest } = init;
  const url = path.startsWith("http") ? path : `${X_API_BASE}/${path.replace(/^\//, "")}`;
  const doFetch = () =>
    fetch(url, {
      credentials: "include",
      ...rest,
      headers: {
        ...buildXApiHeaders(headerKind),
        ...(rest.headers as Record<string, string> | undefined),
      },
    });

  let response = await doFetch();
  if (
    (response.status === 401 || response.status === 403) &&
    loadMirroredApiHeaders()["x-client-transaction-id"]
  ) {
    clearMirroredTransactionId();
    response = await doFetch();
  }
  return response;
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
  const viewerId = await resolveXViewerId();
  if (!viewerId) {
    throw new PlatformApiError(401, "X viewer id not found", false, "session");
  }
  const probe = await fetchXApiJson("account/verify_credentials.json?skip_status=true");
  if (!probe.ok) {
    const kind = probe.status === 401 || probe.status === 403 ? "session" : "api";
    throw new PlatformApiError(probe.status, `X session probe HTTP ${probe.status}`, false, kind);
  }
}
