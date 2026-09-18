import test from "node:test";
import assert from "node:assert/strict";
import { listItems } from "./api.js";
test("pages the catalog", () => {
  assert.deepEqual(listItems(1, 3), { items: [{ id: 1 }, { id: 2 }, { id: 3 }], total: 10, pages: 4 });
  assert.deepEqual(listItems(4, 3), { items: [{ id: 10 }], total: 10, pages: 4 });
  assert.deepEqual(listItems(9, 3), { items: [], total: 10, pages: 4 });
});
