import test from "node:test";
import assert from "node:assert/strict";
import { byPriority } from "./order.js";
test("sorts by priority ascending", () => {
  const tasks = [
    { id: "c", priority: 3 },
    { id: "a", priority: 1 },
    { id: "b", priority: 2 },
  ];
  assert.deepEqual(byPriority(tasks).map((t) => t.id), ["a", "b", "c"]);
});
