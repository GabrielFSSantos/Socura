import { expect, test } from "./fixtures";
import { injectBundle } from "./helpers";

test.use({ platform: "x" });

test.describe("X.com — modos de auditoria", () => {
  test("following_all inicia escaneamento de seguindo", async ({ page }) => {
    await injectBundle(page, "https://x.com/home");
    await page.getByRole("radio", { name: /todos que eu sigo/i }).check();
    await page.getByRole("button", { name: /iniciar escaneamento/i }).click({ timeout: 30_000 });
    await expect(page.getByText(/verificando seguidos|indexando|%/i).first()).toBeVisible({
      timeout: 90_000,
    });
  });

  test("followers_manage modo disponível e inicia lista de seguidores", async ({ page }) => {
    await injectBundle(page, "https://x.com/home");
    const manageRadio = page.getByRole("radio", { name: /remover seguidor/i });
    await expect(manageRadio).toBeEnabled();
    await manageRadio.check();
    await page.getByRole("button", { name: /iniciar escaneamento/i }).click({ timeout: 30_000 });
    await expect(page.getByText(/indexando seguidores|seguidores/i).first()).toBeVisible({
      timeout: 90_000,
    });
    await expect(page.getByRole("button", { name: /remover seguidor/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
