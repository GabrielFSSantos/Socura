import { expect, test } from "./fixtures";

test.use({ platform: "x" });

const live = process.env.E2E_LIVE_REMOVE_FOLLOWER === "1";
const targetUserId = process.env.E2E_LIVE_REMOVE_FOLLOWER_USER_ID ?? "";

test.describe("X remove follower live (opt-in)", () => {
  test.skip(!live || !targetUserId, "Defina E2E_LIVE_REMOVE_FOLLOWER=1 e E2E_LIVE_REMOVE_FOLLOWER_USER_ID");

  test("friendships/remove_follower em uma conta de teste", async ({ page }) => {
    const { warmSession } = await import("../../scripts/dev-auth/warm-session.mjs");
    await warmSession(page, "x");

    const status = await page.evaluate(async userId => {
      const ct0 = document.cookie.match(/(?:^|;\s*)ct0=([^;]+)/)?.[1] ?? "";
      const res = await fetch("https://x.com/i/api/1.1/friendships/remove_follower.json", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "x-csrf-token": decodeURIComponent(ct0),
          "x-twitter-auth-type": "OAuth2Session",
          "x-twitter-active-user": "yes",
        },
        body: new URLSearchParams({ user_id: userId }).toString(),
      });
      return res.status;
    }, targetUserId);

    expect([200, 404]).toContain(status);
  });
});
