import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
export const authDir = join(root, "e2e/.auth");

export function profileDirFor(platform) {
  return join(authDir, platform === "instagram" ? "ig-browser-profile" : "x-browser-profile");
}

export function storagePathFor(platform) {
  return join(authDir, platform === "instagram" ? "ig-storage-state.json" : "storage-state.json");
}

export function isXLoginOrChallengeUrl(url) {
  return /\/i\/flow\/login|\/login|oauth|account\/access|knowledge_check|\/i\/jf\/onboarding/i.test(
    url,
  );
}

const PERSISTENT_OPTS = {
  headless: false,
  viewport: { width: 1280, height: 900 },
  locale: "pt-BR",
  ignoreDefaultArgs: ["--enable-automation"],
  args: ["--disable-blink-features=AutomationControlled"],
};

function channelCandidates() {
  const fromEnv = process.env.PW_CHANNEL?.trim();
  const list = [];
  if (fromEnv) {
    list.push(fromEnv);
  }
  for (const c of ["chrome", "msedge"]) {
    if (!list.includes(c)) {
      list.push(c);
    }
  }
  return list;
}

export async function launchLoginContext(platform) {
  mkdirSync(authDir, { recursive: true });
  const profileDir = profileDirFor(platform);

  for (const channel of channelCandidates()) {
    try {
      const context = await chromium.launchPersistentContext(profileDir, {
        ...PERSISTENT_OPTS,
        channel,
      });
      console.log(`==> ${platform}: ${channel} (perfil ${profileDir})`);
      return context;
    } catch (e) {
      console.warn(`==> Canal "${channel}" indisponível: ${e.message}`);
    }
  }

  return chromium.launchPersistentContext(profileDir, PERSISTENT_OPTS);
}

export async function launchSessionContext(platform, { headless = false } = {}) {
  mkdirSync(authDir, { recursive: true });
  const profileDir = profileDirFor(platform);
  const opts = { ...PERSISTENT_OPTS, headless };

  for (const channel of channelCandidates()) {
    try {
      const context = await chromium.launchPersistentContext(profileDir, {
        ...opts,
        channel,
      });
      return { context, persistent: true };
    } catch {
      /* next */
    }
  }

  const context = await chromium.launchPersistentContext(profileDir, opts);
  return { context, persistent: true };
}

export async function contextHasSession(platform, context) {
  const origin = platform === "instagram" ? "https://www.instagram.com" : "https://x.com";
  const cookies = await context.cookies(origin);
  if (platform === "instagram") {
    return cookies.some(c => c.name === "sessionid" && c.value);
  }
  return cookies.some(c => c.name === "ct0" && c.value);
}

export async function tryBypassKnowledgeCheck(page) {
  const usePassword = page.getByRole("link", { name: /use password|usar senha/i }).first();
  if (await usePassword.count()) {
    await usePassword.click({ timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(1500);
    return true;
  }
  return false;
}

export function loginUrlFor(platform) {
  return platform === "instagram"
    ? "https://www.instagram.com/accounts/login/"
    : "https://x.com/i/flow/login";
}

export function homeUrlFor(platform) {
  return platform === "instagram" ? "https://www.instagram.com/" : "https://x.com/home";
}
