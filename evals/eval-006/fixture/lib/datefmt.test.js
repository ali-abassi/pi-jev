import test from "node:test";
import assert from "node:assert/strict";
import { isoDay } from "./datefmt.js";
test("pads month and day", () => {
  assert.equal(isoDay(new Date(2026, 0, 5)), "2026-01-05");
  assert.equal(isoDay(new Date(2026, 10, 25)), "2026-11-25");
});
