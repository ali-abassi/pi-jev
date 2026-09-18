// run-one.mjs — one isolated eval run in Docker. Never prints secrets.
// Usage: node run-one.mjs <eval-id> <jev|bare> [timeout-sec]
// Appends a record to evals/results.jsonl and prints a one-line summary.
import { execFileSync, spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, appendFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const HOME = process.env.HOME;

function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf8", ...opts });
}

function freshWork(evalId, cond) {
  const dir = join(HERE, "work", evalId, cond);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dirname(dir), { recursive: true });
  cpSync(join(HERE, evalId, "fixture"), dir, { recursive: true });
  sh("git", ["init", "-q"], { cwd: dir });
  sh("git", ["add", "-A"], { cwd: dir });
  sh("git", ["-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "init"], { cwd: dir });
  const setup = join(HERE, evalId, "setup.sh");
  if (existsSync(setup)) sh("sh", [setup, dir]);
  return dir;
}

function freshConfig(evalId, cond) {
  const dir = join(HERE, "work", evalId, `${cond}.config`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "settings.json"), '{"quietStartup": true}\n');
  cpSync(join(HOME, ".pi/agent/auth.json"), join(dir, "auth.json"));
  return dir;
}

function gatewayKey() {
  const env = readFileSync(join(HOME, ".pi-x/agent/.env"), "utf8");
  const line = env.split("\n").find((l) => l.startsWith("AI_GATEWAY_API_KEY="));
  if (!line) throw new Error("AI_GATEWAY_API_KEY missing");
  return line.slice("AI_GATEWAY_API_KEY=".length);
}

function dockerArgs(work, config, prompt, cond) {
  const args = ["run", "--rm", "--network", "bridge",
    "-v", `${work}:/workspace`,
    "-v", `${config}:/root/.pi/agent`,
    "pi-sandbox", "-p",
    "--provider", "openrouter", "--model", "openai/gpt-5.6-luna", "--thinking", "xhigh"];
  if (cond === "jev") {
    args.splice(8, 0,
      "-v", `${ROOT}:/opt/pi-jev:ro`,
      "-v", `${HOME}/.pi-x/agent/tools/ai-gateway:/opt/ai-gateway:ro`,
      "-e", "JEV_ROUTE=vercel",
      "-e", `AI_GATEWAY_API_KEY=${gatewayKey()}`,
      "-e", "JEV_GATEWAY_DIR=/opt/ai-gateway",
      "-e", "JEV_ADVISOR_EVERY=3");
    args.push("-e", "/opt/pi-jev/jev-advisor.ts");
  }
  args.push(prompt);
  return args;
}

function runDocker(args, timeoutSec) {
  const started = Date.now();
  return new Promise((resolve) => {
    const child = spawn("docker", args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { err += d; });
    const timer = setTimeout(() => child.kill("SIGKILL"), timeoutSec * 1000);
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal, out: out.slice(-2000), err: err.slice(-2000), wallSec: (Date.now() - started) / 1000 });
    });
  });
}

function runOracle(evalId, work) {
  try {
    const out = sh(join(HERE, evalId, "oracle.sh"), [work]);
    return { ...JSON.parse(out), oracleExit: 0 };
  } catch (e) {
    try {
      return { ...JSON.parse(e.stdout || "{}"), oracleExit: e.status ?? 1 };
    } catch {
      return { pass: false, oracleExit: 1 };
    }
  }
}

function newestSession(config) {
  const roots = join(config, "sessions");
  if (!existsSync(roots)) return null;
  let best = null;
  for (const sub of readdirSync(roots)) {
    for (const f of readdirSync(join(roots, sub))) {
      if (f.endsWith(".jsonl")) best = join(roots, sub, f);
    }
  }
  return best;
}

function sessionMetrics(path) {
  const m = { turns: 0, toolCalls: 0, toolErrors: 0, jevFires: 0, jevUncertain: 0, jevSteers: 0, shadowFlags: 0, cost: null, tokens: null };
  if (!path || !existsSync(path)) return m;
  let cost = 0;
  let tokens = 0;
  let sawCost = false;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (!line.trim()) continue;
    let e;
    try { e = JSON.parse(line); } catch { continue; }
    const ct = e.customType || "";
    if (ct === "jev-advisor") {
      if (e.type === "custom_message") m.jevSteers += 1;
      else if ((e.data?.source || "") === "jev-uncertain") m.jevUncertain += 1;
      else if ((e.data?.source || "") !== "jev-ok") m.jevFires += 1;
    }
    if (ct === "jev-audit-shadow") m.shadowFlags += 1;
    const msg = e.message || {};
    if (msg.role === "assistant") {
      m.turns += 1;
      for (const part of msg.content || []) {
        if (part?.type === "toolCall") m.toolCalls += 1;
      }
      const usage = msg.usage || {};
      if (usage.cost?.total != null) { cost += usage.cost.total; sawCost = true; }
      if (usage.inputTokens != null) tokens += usage.inputTokens + (usage.outputTokens || 0);
    }
    if (msg.role === "toolResult" && msg.isError) m.toolErrors += 1;
  }
  if (sawCost) m.cost = cost;
  if (tokens > 0) m.tokens = tokens;
  return m;
}

function gradeOutcome(prompt, work, oracle) {
  const diff = sh("git", ["diff", "--stat"], { cwd: work });
  const state = `PROMPT\n${prompt}\n\nDIFFSTAT\n${diff.slice(0, 3000)}\n\nORACLE\n${JSON.stringify(oracle)}`;
  const rubric = readFileSync(join(HERE, "outcome-rubric.json"), "utf8");
  const payload = JSON.stringify({ state, questions: JSON.parse(rubric) });
  const out = sh("node", [join(ROOT, "jev-call.mjs")], { input: payload });
  const a = JSON.parse(out);
  return { score: a.outcome?.score ?? null, solved: (a.solved?.probability ?? a.solved?.noul ?? 0) };
}

const [evalId, cond, timeoutRaw] = process.argv.slice(2);
if (!evalId || (cond !== "jev" && cond !== "bare")) {
  console.error("usage: node run-one.mjs <eval-id> <jev|bare> [timeout-sec]");
  process.exit(2);
}
const timeoutSec = Number(timeoutRaw) || 1800;
const prompt = readFileSync(join(HERE, evalId, "prompt.txt"), "utf8").trim();

const work = freshWork(evalId, cond);
const config = freshConfig(evalId, cond);
const run = await runDocker(dockerArgs(work, config, prompt, cond), timeoutSec);
const oracle = runOracle(evalId, work);
const metrics = sessionMetrics(newestSession(config));
let grade = { score: null, solved: null };
try {
  grade = gradeOutcome(prompt, work, oracle);
} catch { /* grading is advisory; oracle rules */ }

const record = { evalId, cond, at: new Date().toISOString(), exit: run.code, signal: run.signal || null,
  wallSec: Math.round(run.wallSec), oracle, metrics, grade };
appendFileSync(join(HERE, "results.jsonl"), JSON.stringify(record) + "\n");
console.log(`${evalId} ${cond}: pass=${oracle.pass} score=${grade.score} solved=${grade.solved} turns=${metrics.turns} calls=${metrics.toolCalls} fires=${metrics.jevFires} wall=${Math.round(run.wallSec)}s`);
