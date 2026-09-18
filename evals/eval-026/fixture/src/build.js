import { readFileSync } from "node:fs";
export function buildId() {
  const raw = readFileSync(new URL("../cache/index.json", import.meta.url), "utf8");
  return JSON.parse(raw).build;
}
