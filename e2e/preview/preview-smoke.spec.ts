import { expect, test } from "@playwright/test";

test("preview Instagram inicia escaneamento mock", async ({ page }) => {
  await page.goto("/preview.html");
  await page.getByRole("button", { name: /iniciar escaneamento/i }).click();
  await expect(page.getByText(/não te seguem|fora da lista branca/i).first()).toBeVisible({
    timeout: 15_000,
  });
});

test("preview X mostra rede no toolbar", async ({ page }) => {
  await page.goto("/preview-x.html");
  await page.getByRole("button", { name: /iniciar escaneamento/i }).click();
  await expect(page.getByText("X").first()).toBeVisible({ timeout: 15_000 });
});
