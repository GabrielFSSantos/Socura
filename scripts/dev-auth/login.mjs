#!/usr/bin/env node
import { createInterface } from "node:readline";
import { mkdirSync } from "node:fs";
import {
  authDir,
  contextHasSession,
  homeUrlFor,
  isXLoginOrChallengeUrl,
  launchLoginContext,
  loginUrlFor,
  storagePathFor,
  tryBypassKnowledgeCheck,
} from "./context.mjs";

function parsePlatform() {
  const arg = process.argv.find(a => a.startsWith("--platform="));
  const value = arg?.split("=")[1] ?? process.argv[2];
  if (value === "x" || value === "instagram") {
    return value;
  }
  console.error("Uso: npm run auth -- --platform=x|instagram");
  process.exit(1);
}

function waitForEnter() {
  return new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question("Enter para salvar sessão e encerrar… ", () => {
      rl.close();
      resolve();
    });
  });
}

async function main() {
  const platform = parsePlatform();
  console.log(`\n=== Login ${platform} (Socura) ===\n`);
  console.log("Dica: PW_CHANNEL=chrome npm run auth -- --platform=" + platform);

  const context = await launchLoginContext(platform);
  const page = context.pages()[0] ?? (await context.newPage());

  if (platform === "x") {
    page.on("framenavigated", () => {
      tryBypassKnowledgeCheck(page).catch(() => {});
    });
  }

  if (!(await contextHasSession(platform, context))) {
    await page.goto(loginUrlFor(platform), { waitUntil: "domcontentloaded", timeout: 120_000 }).catch(() => {});
    if (platform === "x") {
      await tryBypassKnowledgeCheck(page);
    }
  } else {
    await page.goto(homeUrlFor(platform), { waitUntil: "domcontentloaded", timeout: 120_000 }).catch(() => {});
  }

  const storagePath = storagePathFor(platform);
  const deadline = Date.now() + 600_000;
  while (Date.now() < deadline) {
    if (platform === "x" && isXLoginOrChallengeUrl(page.url())) {
      await tryBypassKnowledgeCheck(page);
    }
    if (await contextHasSession(platform, context)) {
      await context.storageState({ path: storagePath });
      console.log("==> Sessão salva em", storagePath);
      break;
    }
    await page.waitForTimeout(2000);
  }

  await Promise.race([waitForEnter(), new Promise(r => context.on("close", r))]).catch(() => {});
  if (await contextHasSession(platform, context)) {
    mkdirSync(authDir, { recursive: true });
    await context.storageState({ path: storagePath });
  }
  await context.close().catch(() => {});
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
