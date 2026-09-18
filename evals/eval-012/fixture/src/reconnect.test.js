import test from "node:test";
import assert from "node:assert/strict";
import { delays } from "./reconnect.js";
test("one delay per retry", () => {
  assert.deepEqual(delays(100, 3), [100, 200, 400]);
  assert.deepEqual(delays(50, 0), []);
});
