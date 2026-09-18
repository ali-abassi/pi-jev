import { readFileSync } from "node:fs";
export function totalQty() {
  const data = JSON.parse(readFileSync(new URL("./data.json", import.meta.url), "utf8"));
  return data.items.reduce((s, i) => s + i.qty, 0);
}
