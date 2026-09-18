import test from "node:test";
import assert from "node:assert/strict";
import { total, shipping } from "./cart.js";

test("applies a single discount then tax", () => {
  assert.equal(total([{ price: 100, qty: 1 }], 10, 10), 99);
});

test("discount then tax on multi-item cart", () => {
  assert.equal(total([{ price: 40, qty: 2 }, { price: 20, qty: 1 }], 20, 5), 84);
});

test("free shipping over $50", () => {
  assert.equal(shipping(50.01), 0);
  assert.equal(shipping(50), 0);
  assert.equal(shipping(49.99), 4.95);
});
