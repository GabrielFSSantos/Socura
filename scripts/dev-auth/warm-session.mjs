import { warmXSessionAndCapture } from "../x-network-capture.mjs";

/** @param {import('playwright').Page} page */
export async function warmSession(page, platform, options = {}) {
  if (platform === "instagram") {
    await page.goto("https://www.instagram.com/", { waitUntil: "domcontentloaded", timeout: 120_000 });
    await page.waitForTimeout(3000);
    const profile = page.locator('a[href*="/accounts/edit"]').first();
    if (await profile.count()) {
      await profile.click({ timeout: 10_000 }).catch(() => {});
      await page.waitForTimeout(2000);
    }
    return { headers: {}, saved: false };
  }
  return warmXSessionAndCapture(page, options);
}
