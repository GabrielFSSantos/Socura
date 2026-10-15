import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseXListResponse } from "../src/platform/x/x-list-parse";
import { parseViewerIdFromTwidCookie } from "../src/platform/x/x-http";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const followers = JSON.parse(
  readFileSync(join(root, "tests/fixtures/x/followers-list-ok.json"), "utf8"),
);
const page = parseXListResponse(followers);
assert.equal(page.users.length, 1);
assert.equal(page.users[0].username, "follower_one");
assert.equal(page.hasMore, false);

assert.equal(parseViewerIdFromTwidCookie("u%3D12345678901"), "12345678901");
assert.equal(parseViewerIdFromTwidCookie("u%3D9876543210"), "9876543210");

console.log("test-x-list-parse: OK");
