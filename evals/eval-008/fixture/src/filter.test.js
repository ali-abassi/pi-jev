import test from "node:test";
import assert from "node:assert/strict";
import { search } from "./filter.js";
const items = [{ name: "Apple" }, { name: "Banana" }, { name: "Grape" }];
test("case-insensitive, empty query returns all", () => {
  assert.deepEqual(search(items, "ap").map((i) => i.name), ["Apple", "Grape"]);
  assert.deepEqual(search(items, ""), items);
});
