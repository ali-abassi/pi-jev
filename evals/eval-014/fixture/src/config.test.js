import test from "node:test";
import assert from "node:assert/strict";
import { url, timeout } from "./config.js";
test("loads from env file", () => {
  assert.equal(url, "https://api.example.com");
  assert.equal(timeout, 5000);
});
