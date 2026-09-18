import test from "node:test";
import assert from "node:assert/strict";
import { order } from "./topo.js";
test("orders dependencies first", () => {
  const out = order({ app: ["lib", "cfg"], lib: ["cfg"], cfg: [] });
  assert.ok(out.indexOf("cfg") < out.indexOf("lib"));
  assert.ok(out.indexOf("lib") < out.indexOf("app"));
  assert.deepEqual([...out].sort(), ["app", "cfg", "lib"]);
  assert.throws(() => order({ a: ["b"], b: ["a"] }));
});
