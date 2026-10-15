import { expect, test } from "@playwright/test";

test("modo followers_manage mostra ação remover seguidor", async ({ page }) => {
  await page.goto("/preview-x.html?platform=x&preview=scanning&mode=followers_manage");
  await expect(page.getByRole("button", { name: /remover seguidor/i })).toBeVisible({
    timeout: 10_000,
  });
});

test("modo following_all mantém deixar de seguir", async ({ page }) => {
  await page.goto("/preview-x.html?platform=x&preview=scanning&mode=following_all");
  await expect(page.getByRole("button", { name: /deixar de seguir/i })).toBeVisible({
    timeout: 10_000,
  });
});
