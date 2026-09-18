import test from "node:test";
import assert from "node:assert/strict";
import { totalQty } from "./sum.js";
test("sums fixture quantities", () => {
  assert.equal(totalQty(), 5);
});
