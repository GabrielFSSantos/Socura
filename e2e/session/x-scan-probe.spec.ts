import { expect, test } from "./fixtures";
import { injectXHeaderMirror } from "./helpers";
import { X_GRAPHQL_FOLLOWERS_QUERY_ID } from "../../src/constants/x-constants";

test.use({ platform: "x" });

type ProbeReport = {
  cookies: { name: string; present: boolean }[];
  bearerFromPage: boolean;
  viewerIdPresent: boolean;
  probes: { label: string; status?: number; bodyPreview?: string; error?: string }[];
};

test.describe("X.com — probe de sessão (API)", () => {
  test("verify + followers (+ graphql opcional)", async ({ page }) => {
    await injectXHeaderMirror(page);
    await page.goto("https://x.com/home", { waitUntil: "domcontentloaded", timeout: 120_000 });

    const report = await page.evaluate(async (graphqlFollowersQueryId: string) => {
      const cookieNames = ["auth_token", "ct0", "twid"];
      const cookies = cookieNames.map(name => ({
        name,
        present: document.cookie.includes(`${name}=`),
      }));

      let mirror: Record<string, string> = {};
      try {
        mirror = JSON.parse(localStorage.getItem("iu_x_api_header_mirror") ?? "{}");
      } catch {
        mirror = {};
      }

      let bearerFromPage: string | null =
        document.documentElement?.innerHTML.match(
          /Bearer\s+(AAAAAAAAAAAAAAAAAAAAA[A-Za-z0-9%]+)/,
        )?.[1] ?? null;

      const probes: ProbeReport["probes"] = [];

      const ct0 = document.cookie.match(/(?:^|;\s*)ct0=([^;]+)/)?.[1] ?? "";
      const baseHeaders: Record<string, string> = {
        "x-csrf-token": decodeURIComponent(ct0),
        "x-twitter-auth-type": "OAuth2Session",
        "x-twitter-active-user": "yes",
        ...mirror,
      };
      if (mirror.authorization) {
        baseHeaders.authorization = mirror.authorization;
      } else if (bearerFromPage) {
        baseHeaders.authorization = `Bearer ${decodeURIComponent(bearerFromPage)}`;
      }

      async function probe(label: string, url: string, init?: RequestInit) {
        try {
          const res = await fetch(url, { credentials: "include", ...init });
          const text = await res.text();
          probes.push({
            label,
            status: res.status,
            bodyPreview: text.slice(0, 200),
          });
        } catch (e) {
          probes.push({ label, error: String(e) });
        }
      }

      await probe(
        "verify_credentials",
        "https://x.com/i/api/1.1/account/verify_credentials.json",
        { headers: baseHeaders },
      );

      await probe(
        "followers_rest",
        "https://x.com/i/api/1.1/followers/list.json?count=1",
        { headers: baseHeaders },
      );

      if (graphqlFollowersQueryId) {
        const variables = encodeURIComponent(JSON.stringify({ userId: "", count: 1, includePromotedContent: false }));
        await probe(
          "followers_graphql",
          `https://x.com/i/api/graphql/${graphqlFollowersQueryId}/Followers?variables=${variables}`,
          { headers: baseHeaders },
        );
      }

      const viewerIdPresent = Boolean(
        document.documentElement.innerHTML.match(/"rest_id":"(\d+)"/)?.[1],
      );

      return {
        cookies,
        bearerFromPage: Boolean(baseHeaders.authorization),
        viewerIdPresent,
        probes,
      } satisfies ProbeReport;
    }, X_GRAPHQL_FOLLOWERS_QUERY_ID);

    test.info().attach("x-probe-report.json", {
      body: JSON.stringify(report, null, 2),
      contentType: "application/json",
    });

    expect(report.cookies.find(c => c.name === "ct0")?.present).toBeTruthy();
    const followers = report.probes.find(p => p.label === "followers_rest");
    expect(followers?.status).toBe(200);
  });
});
