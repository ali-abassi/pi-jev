// run-all.mjs — full eval matrix, sequential, resumable.
// Usage: node run-all.mjs [--evals 001,002] [--timeout 1200]
// Alternates starting condition per eval to balance time effects.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const evalFilter = args.includes("--evals") ? args[args.indexOf("--evals") + 1].split(",") : null;
const timeout = args.includes("--timeout") ? args[args.indexOf("--timeout") + 1] : "1200";

const done = new Set();
if (existsSync(join(HERE, "results.jsonl"))) {
  for (const line of readFileSync(join(HERE, "results.jsonl"), "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      const r = JSON.parse(line);
      done.add(`${r.evalId}:${r.cond}`);
    } catch { /* skip */ }
  }
}

let evals = readdirSync(HERE).filter((f) => /^eval-\d+$/.test(f)).sort();
if (evalFilter) evals = evals.filter((e) => evalFilter.includes(e.slice(5)));

let flip = false;
for (const evalId of evals) {
  const order = flip ? ["jev", "bare"] : ["bare", "jev"];
  flip = !flip;
  for (const cond of order) {
    if (done.has(`${evalId}:${cond}`)) {
      console.log(`${evalId} ${cond}: skipped (done)`);
      continue;
    }
    const r = spawnSync("node", ["run-one.mjs", evalId, cond, timeout], { cwd: HERE, encoding: "utf8" });
    console.log((r.stdout || "").trim());
    if (r.status !== 0) console.log(`${evalId} ${cond}: RUNNER_ERROR ${(r.stderr || "").slice(0, 300)}`);
  }
}
console.log("MATRIX_DONE");
