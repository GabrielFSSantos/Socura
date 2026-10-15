import { expect, test } from "@playwright/test";

test("visão quem me segue mostra ação remover seguidor", async ({ page }) => {
  await page.goto("/preview.html?preview=scanning");
  await page.getByRole("button", { name: /quem me segue/i }).click();
  await expect(page.locator("aside .unfollow")).toContainText(/remover seguidor/i, {
    timeout: 10_000,
  });
});

test("visão todos que sigo mantém deixar de seguir", async ({ page }) => {
  await page.goto("/preview-x.html?platform=x&preview=scanning");
  await page.getByRole("button", { name: /todos que eu sigo/i }).click();
  await expect(page.locator("aside .unfollow")).toContainText(/deixar de seguir/i, {
    timeout: 10_000,
  });
});

test("alterna visão na sidebar sem novo scan", async ({ page }) => {
  await page.goto("/preview.html?preview=scanning");
  await page.getByRole("button", { name: /todos que eu sigo/i }).click();
  await expect(page.locator(".lens-btn-active")).toContainText(/todos que eu sigo/i);
  await page.getByRole("button", { name: /quem me segue/i }).click();
  await expect(page.locator(".lens-btn-active")).toContainText(/quem me segue/i);
  await expect(page.locator("aside .unfollow")).toContainText(/remover seguidor/i);
});
