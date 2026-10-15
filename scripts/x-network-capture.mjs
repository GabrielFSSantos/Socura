export const HEADER_ALLOW = new Set([
  "authorization",
  "x-csrf-token",
  "x-client-transaction-id",
  "x-client-uuid",
  "x-twitter-client-language",
  "x-twitter-auth-type",
  "x-twitter-active-user",
]);

export function pickApiHeaders(raw) {
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    const lower = k.toLowerCase();
    if (HEADER_ALLOW.has(lower) && v) {
      out[lower] = String(v);
    }
  }
  return out;
}

const MIRROR_KEY = "iu_x_api_header_mirror";

export function attachXApiHeaderCapture(page, onUpdate) {
  let merged = {};
  const handler = req => {
    const url = req.url();
    if (!url.includes("/i/api/")) {
      return;
    }
    const chunk = pickApiHeaders(req.headers());
    if (Object.keys(chunk).length === 0) {
      return;
    }
    merged = { ...merged, ...chunk };
    onUpdate?.(merged);
  };
  page.on("request", handler);
  return {
    getHeaders: () => merged,
    detach: () => page.off("request", handler),
    async persistToPage() {
      if (Object.keys(merged).length === 0) {
        return false;
      }
      await page.evaluate(
        ({ key, json }) => localStorage.setItem(key, json),
        { key: MIRROR_KEY, json: JSON.stringify(merged) },
      );
      return true;
    },
  };
}

export async function warmXSessionAndCapture(page, { writeHeadersPath } = {}) {
  const capture = attachXApiHeaderCapture(page);
  await page.goto("https://x.com/home", { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(2500);

  await page
    .waitForResponse(
      r => r.url().includes("/i/api/") && r.status() >= 200 && r.status() < 400,
      { timeout: 45_000 },
    )
    .catch(() => null);

  const profile = page.locator('a[data-testid="AppTabBar_Profile_Link"]').first();
  if (await profile.count()) {
    await profile.click({ timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(2000);
  }

  for (const pattern of [/followers/i, /seguidores/i]) {
    const link = page.getByRole("link", { name: pattern }).first();
    if (await link.count()) {
      await link.click({ timeout: 10_000 }).catch(() => {});
      await page.waitForTimeout(3500);
      break;
    }
  }

  await page
    .waitForResponse(
      r =>
        (r.url().includes("followers") || r.url().includes("Followers")) &&
        r.url().includes("/i/api/"),
      { timeout: 30_000 },
    )
    .catch(() => null);

  const saved = await capture.persistToPage();
  capture.detach();

  if (writeHeadersPath && Object.keys(capture.getHeaders()).length > 0) {
    const { writeFileSync } = await import("node:fs");
    writeFileSync(writeHeadersPath, JSON.stringify(capture.getHeaders(), null, 2));
  }

  return { headers: capture.getHeaders(), saved };
}
