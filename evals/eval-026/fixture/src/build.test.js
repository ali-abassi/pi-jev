import test from "node:test";
import assert from "node:assert/strict";
import { buildId } from "./build.js";
test("reads the build cache", () => {
  assert.equal(buildId(), 987);
});
