import { expect, test } from "./fixtures";

test.use({ platform: "instagram" });

test.describe("Instagram — sessão", () => {
  test("home carrega logado", async ({ page }) => {
    await expect(page).not.toHaveURL(/accounts\/login/);
  });
});
