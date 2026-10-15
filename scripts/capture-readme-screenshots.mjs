import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, statSync } from "node:fs";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = join(root, "assets");

async function shot(page, url, outName, clip) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.screenshot({ path: join(assetsDir, outName), clip });
}

async function main() {
  mkdirSync(assetsDir, { recursive: true });
  if (!statSync(join(root, "dist/dist.js")).isFile()) {
    console.error("Rode npm run build antes de screenshots:readme");
    process.exit(1);
  }
  const server = spawn("node", ["scripts/e2e-static-server.mjs"], { cwd: root, stdio: "inherit" });
  await new Promise(r => setTimeout(r, 800));
  const base = "http://127.0.0.1:4173";
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await shot(page, `${base}/index.html`, "copy_code.png", {
    x: 0,
    y: 0,
    width: 1280,
    height: 520,
  });

  await page.goto(`${base}/preview.html`);
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(assetsDir, "initial.png"), fullPage: false });

  await page.goto(`${base}/preview.html?preview=scanning`);
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(assetsDir, "results.png"), fullPage: false });

  await page.goto(`${base}/preview.html?preview=scanning`);
  await page.getByRole("button", { name: /configurações/i }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(assetsDir, "settings.png"), fullPage: false });

  await page.goto(`${base}/preview.html?preview=scanning`);
  await page.getByRole("button", { name: /configurações/i }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(assetsDir, "settings_whitelist.png"), fullPage: false });

  await page.goto(`${base}/preview-x.html?preview=scanning`);
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(assetsDir, "initial_x.png"), fullPage: false });

  await browser.close();
  server.kill();
  console.log("screenshots:readme OK → assets/");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
