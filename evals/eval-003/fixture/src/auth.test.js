import test from "node:test";
import assert from "node:assert/strict";
import { isExpired, remainingMs } from "./auth.js";
test("expires exactly at ttl", () => {
  assert.equal(isExpired(1000, 10, 11000), true);
  assert.equal(isExpired(1000, 10, 10999), false);
});
test("remaining is in ms", () => {
  assert.equal(remainingMs(1000, 10, 3000), 8000);
});
