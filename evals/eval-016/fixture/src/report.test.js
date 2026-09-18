import test from "node:test";
import assert from "node:assert/strict";
import { dayLabel } from "./report.js";
test("labels the UTC day regardless of zone", () => {
  assert.equal(dayLabel("2026-01-05T00:30:00+02:00"), "2026-01-05");
  assert.equal(dayLabel("2026-06-01T23:30:00-05:00"), "2026-06-02");
});
