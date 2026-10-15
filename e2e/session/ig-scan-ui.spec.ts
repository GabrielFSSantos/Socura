import { expect, test } from "./fixtures";
import { injectBundle } from "./helpers";

test.use({ platform: "instagram" });

test.describe("Instagram — scan ao vivo", () => {
  test("injeta bundle e inicia escaneamento", async ({ page }) => {
    await injectBundle(page, "https://www.instagram.com/");
    await page.getByRole("button", { name: /iniciar escaneamento/i }).click({ timeout: 30_000 });
    await expect(
      page.getByText(/indexando seguidores|verificando seguidos|não te seguem|escaneamento/i).first(),
    ).toBeVisible({ timeout: 120_000 });
  });
});
