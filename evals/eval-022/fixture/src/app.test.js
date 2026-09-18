import test from "node:test";
import assert from "node:assert/strict";
import { run } from "./app.js";
test("runs the pipeline", () => {
  assert.equal(run(20), 41);
});
