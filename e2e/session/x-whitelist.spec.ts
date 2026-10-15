import { expect, test } from "./fixtures";
import { injectBundle } from "./helpers";

test.use({ platform: "x" });

test.describe("X.com — lista branca", () => {
  test("adiciona usuário e persiste no localStorage", async ({ page }) => {
    await injectBundle(page, "https://x.com/home");
    await page.getByRole("button", { name: /iniciar escaneamento/i }).click({ timeout: 30_000 });

    const firstRow = page.locator("label.result-item").first();
    await expect(firstRow).toBeVisible({ timeout: 120_000 });
    const userLink = firstRow.getByRole("link").first();
    const username = await userLink.textContent();
    await firstRow.locator(".avatar-container").click();

    await page.getByRole("button", { name: /na lista branca/i }).click();
    if (username?.trim()) {
      await expect(page.getByRole("link", { name: username.trim() })).toBeVisible({ timeout: 10_000 });
    }

    const stored = await page.evaluate(() => localStorage.getItem("iu_whitelisted-results"));
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored ?? "[]") as { username?: string }[];
    expect(parsed.length).toBeGreaterThan(0);
  });
});
