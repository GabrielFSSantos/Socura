import { existsSync, readFileSync } from "node:fs";
import type { Page } from "@playwright/test";

const X_HEADER_MIRROR_KEY = "iu_x_api_header_mirror";
const headersPath = "e2e/.auth/x-api-headers.json";

export async function injectXHeaderMirror(page: Page) {
  if (!existsSync(headersPath)) {
    return;
  }
  const json = readFileSync(headersPath, "utf8");
  await page.addInitScript(
    ({ key, body }) => {
      try {
        localStorage.setItem(key, body);
      } catch {
        /* ignore */
      }
    },
    { key: X_HEADER_MIRROR_KEY, body: json },
  );
}

export async function injectBundle(page: Page, url: string) {
  await injectXHeaderMirror(page);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
  const bundle = readFileSync("dist/dist.js", "utf8");
  await page.evaluate(script => {
    // eslint-disable-next-line no-eval
    eval(script);
  }, bundle);
}
