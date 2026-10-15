import { existsSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const storagePath = "e2e/.auth/storage-state.json";
const hasAuth = existsSync(storagePath);

test.describe("X.com scan ao vivo", () => {
  test.skip(!hasAuth, "Grave sessão: npm run e2e:record");

  test("injeta bundle e inicia escaneamento", async ({ page }) => {
    const bundle = readFileSync("dist/dist.js", "utf8");
    await page.goto("https://x.com/home", { waitUntil: "domcontentloaded" });
    await page.evaluate(script => {
      // eslint-disable-next-line no-eval
      eval(script);
    }, bundle);
    await page.getByRole("button", { name: /iniciar escaneamento/i }).click({ timeout: 30_000 });
    await expect(
      page.getByText(/indexando seguidores|verificando seguidos|não te seguem/i).first(),
    ).toBeVisible({ timeout: 90_000 });
  });
});
