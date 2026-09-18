import { readFileSync } from "node:fs";
const env = Object.fromEntries(
  readFileSync(".env", "utf8").split("\n").filter(Boolean).map((l) => l.split("=")),
);
export const url = env.API_URL;
export const timeout = Number(env.TIMEOUT_MS ?? 5000);
