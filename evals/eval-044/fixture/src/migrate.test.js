import test from "node:test";
import assert from "node:assert/strict";
import { migrate } from "./migrate.js";
test("migrates v1 to v2", () => {
  assert.deepEqual(migrate({ name: "web", port: "8080", debug: "yes" }), {
    service: "web",
    port: 8080,
    debug: true,
  });
  assert.deepEqual(migrate({ name: "x", port: "1", debug: "no" }).debug, false);
  assert.throws(() => migrate({ name: "x", port: "abc", debug: "no" }));
  assert.throws(() => migrate({ name: "x", port: "99999", debug: "no" }));
});
