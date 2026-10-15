import { existsSync, mkdirSync } from "node:fs";
import { test as base, expect } from "@playwright/test";
import { chromium, type BrowserContext, type Page } from "playwright";
import path from "node:path";

export type SessionPlatform = "x" | "instagram";

const authDir = path.resolve("e2e/.auth");
const xHeadersPath = "e2e/.auth/x-api-headers.json";

function profileDir(platform: SessionPlatform) {
  return path.join(authDir, platform === "instagram" ? "ig-browser-profile" : "x-browser-profile");
}

async function contextHasSession(platform: SessionPlatform, context: BrowserContext) {
  const origin = platform === "instagram" ? "https://www.instagram.com" : "https://x.com";
  const cookies = await context.cookies(origin);
  if (platform === "instagram") {
    return cookies.some(c => c.name === "sessionid" && c.value);
  }
  return cookies.some(c => c.name === "ct0" && c.value);
}

async function openLoginIfNeeded(platform: SessionPlatform, page: Page) {
  const { loginUrlFor, tryBypassKnowledgeCheck, isXLoginOrChallengeUrl } = await import(
    "../../scripts/dev-auth/context.mjs"
  );

  if (platform === "x") {
    page.on("framenavigated", () => {
      tryBypassKnowledgeCheck(page).catch(() => {});
    });
  }

  await page.goto(loginUrlFor(platform), { waitUntil: "domcontentloaded", timeout: 120_000 });
  console.log(`\n>>> Faça login em ${platform} na janela aberta (timeout 10 min)…\n`);
  const deadline = Date.now() + 600_000;
  while (Date.now() < deadline) {
    const ctx = page.context();
    if (platform === "x" && isXLoginOrChallengeUrl(page.url())) {
      await tryBypassKnowledgeCheck(page);
    }
    if (await contextHasSession(platform, ctx)) {
      return;
    }
    await page.waitForTimeout(2000);
  }
  throw new Error(`Timeout aguardando login ${platform}`);
}

export async function ensureSession(platform: SessionPlatform, page: Page) {
  const ctx = page.context();
  if (!(await contextHasSession(platform, ctx))) {
    await openLoginIfNeeded(platform, page);
  }
  const { warmSession } = await import("../../scripts/dev-auth/warm-session.mjs");
  await warmSession(
    page,
    platform,
    platform === "x" ? { writeHeadersPath: xHeadersPath } : {},
  );
}

export const test = base.extend<{ platform: SessionPlatform }, { workerContext: BrowserContext }>({
  platform: ["x", { option: true }],

  context: async ({ platform }, use) => {
    const dir = profileDir(platform);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const headless = process.env.HEADLESS === "1";
    const channel = process.env.PW_CHANNEL || "chrome";
    const context = await chromium.launchPersistentContext(dir, {
      channel,
      headless,
      ignoreDefaultArgs: ["--enable-automation"],
      args: ["--disable-blink-features=AutomationControlled"],
      viewport: { width: 1280, height: 900 },
      locale: "pt-BR",
    });

    const page = context.pages()[0] ?? (await context.newPage());
    await ensureSession(platform, page);

    await use(context);
    await context.close();
  },

  page: async ({ context }, use) => {
    const page = context.pages()[0] ?? (await context.newPage());
    await use(page);
  },
});

export { expect };
