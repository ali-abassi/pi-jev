import test from "node:test";
import assert from "node:assert/strict";
import { errors } from "./validate.js";
test("collects all problems without crashing", () => {
  assert.deepEqual(errors({}), ["name", "email", "age"]);
  assert.deepEqual(errors({ name: "Al", email: "a@b.c", age: 30 }), []);
  assert.deepEqual(errors({ name: "", email: "x", age: 9 }), ["name", "email", "age"]);
});
