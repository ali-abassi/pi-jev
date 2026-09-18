import test from "node:test";
import assert from "node:assert/strict";
import { run } from "./main.js";
test("greets by id (async)", async () => {
  assert.equal(await run(1), "hi Ann");
  assert.equal(await run(9), "hi stranger");
});
