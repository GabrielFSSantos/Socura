export const X_HOSTNAMES = new Set(["x.com", "twitter.com", "www.x.com", "mobile.x.com"]);

/** Client bearer used by the X web app (public, not a user secret). Fallback if not found on page. */
export const X_WEB_BEARER_TOKEN =
  "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUgjRCZjsz1k7uOUHRg2W8o%3D1%3B1634725470%3B1634725470";

export const X_API_BASE = "https://x.com/i/api/1.1";
export const X_GRAPHQL_BASE = "https://x.com/i/api/graphql";

/**
 * QueryIds mudam com deploys do X. Atualize via localStorage (iu_x_graphql_*_query_id)
 * ou capture no Network — ver docs/documentation/18_debug_x_sessao.md
 */
export const X_GRAPHQL_FOLLOWERS_QUERY_ID = "S8V0yM3VkaFw8okQaR0GeQ";
export const X_GRAPHQL_FOLLOWING_QUERY_ID = "2Vjey2LtJ8RpV-ye0H4mPg";

export const FOLLOWERS_PAGE_SAFETY_LIMIT_X = 250;
export const FOLLOWING_PAGE_SAFETY_LIMIT_X = 250;

export const X_STORAGE_KEY_PREFIX = "iu_x_";
