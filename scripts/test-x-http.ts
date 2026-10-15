import assert from "node:assert/strict";
import {
  captureMirroredHeadersFromRequestHeaders,
  extractBearerFromText,
  normalizeXCsrfToken,
} from "../src/platform/x/x-http";

const sampleBearer =
  "AAAAAAAAAAAAAAAAAAAAAAXYZ1234567890abcdefghijklmnopqrstuvwxyz%3D1%3B999%3B999";

assert.equal(
  extractBearerFromText(`window.config = "Bearer ${sampleBearer}";`),
  sampleBearer,
);

assert.equal(
  extractBearerFromText(`token:"${sampleBearer}"`),
  sampleBearer,
);

assert.equal(normalizeXCsrfToken("abc%2Bdef"), "abc+def");
assert.equal(normalizeXCsrfToken("plain"), "plain");

const mirrored = captureMirroredHeadersFromRequestHeaders({
  Authorization: `Bearer ${sampleBearer}`,
  "X-CSRF-Token": "tok",
  "X-Client-Transaction-Id": "tx-1",
  "X-Custom-Blocked": "nope",
});
assert.equal(mirrored.authorization, `Bearer ${sampleBearer}`);
assert.equal(mirrored["x-csrf-token"], "tok");
assert.equal(mirrored["x-client-transaction-id"], "tx-1");
assert.equal(mirrored["x-custom-blocked"], undefined);

console.log("test-x-http: OK");
