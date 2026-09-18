import test from "node:test";
import assert from "node:assert/strict";
import { debounce } from "./debounce.js";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
test("fires once after quiet period", async () => {
  let n = 0;
  const f = debounce(() => { n += 1; }, 30);
  f();
  f();
  f();
  await wait(80);
  assert.equal(n, 1);
  f();
  await wait(80);
  assert.equal(n, 2);
});
