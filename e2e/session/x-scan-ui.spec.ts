import { expect, test } from "./fixtures";
import { injectBundle } from "./helpers";

test.use({ platform: "x" });

test.describe("X.com scan ao vivo", () => {
  test("injeta bundle e inicia escaneamento", async ({ page }) => {
    const apiLog: { url: string; status: number }[] = [];
    page.on("response", async res => {
      const url = res.url();
      if (url.includes("/i/api/")) {
        apiLog.push({ url: url.slice(0, 200), status: res.status() });
      }
    });

    await injectBundle(page, "https://x.com/home");

    await page.getByRole("button", { name: /iniciar escaneamento/i }).click({ timeout: 30_000 });
    try {
      await expect(
        page.getByText(/indexando seguidores|verificando seguidos|não te seguem/i).first(),
      ).toBeVisible({ timeout: 90_000 });
    } catch (e) {
      test.info().attach("x-api-log.json", {
        body: JSON.stringify(apiLog.slice(-40), null, 2),
        contentType: "application/json",
      });
      throw e;
    }
  });
});
