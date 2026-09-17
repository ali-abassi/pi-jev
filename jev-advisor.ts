// jev-advisor: Jev watches the run — loop detection, goal alignment,
// prompt/goal conflict, and a shadow auditor for risky tool calls.
// Advisory-first: notify + steer message on fire. Blocking only when
// JEV_ADVISOR_ENFORCE=1. Fails open on every error path.
import type {
  BeforeAgentStartEvent,
  ExtensionAPI,
  ExtensionContext,
  ToolCallEvent,
  ToolExecutionEndEvent,
  ToolExecutionStartEvent,
  TurnEndEvent,
} from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";
import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

// Shadow auditor: high-signal destructive/escape patterns. Notify + log only.
const BASH_PATTERNS: RegExp[] = [
  /\brm\s+(-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r)\b/,
  /:\(\)\s*\{/,
  /\bmkfs\b/,
  /\bdd\b.*\bof=/,
  /git\s+push\b.*--force/,
  /git\s+reset\s+--hard/,
  /chmod\s+-R\s+777/,
  /curl\b.*\|\s*(sh|bash)/,
];
const SENSITIVE_PATH = /(\.env$|\.pem$|key|secret|credential)/i;

interface AdvisorConfig {
  every: number;
  budget: number;
  minScore: number;
  enforce: boolean;
  timeoutMs: number;
  goalPath: string;
}

interface TurnRecord {
  sig: string;
  error: boolean;
}

interface JevScore {
  type: string;
  score: number;
}
interface JevBool {
  type: string;
  probability?: number;
  noul?: number;
}
interface JevAnswers {
  on_track?: JevScore;
  drifting?: JevBool;
  looping?: JevBool;
  goal_conflict?: JevBool;
  unsafe_action?: JevBool;
}

function num(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function loadConfig(): AdvisorConfig {
  return {
    every: num(process.env.JEV_ADVISOR_EVERY, 3),
    budget: num(process.env.JEV_ADVISOR_BUDGET, 20),
    minScore: num(process.env.JEV_ADVISOR_MIN_SCORE, 5),
    enforce: process.env.JEV_ADVISOR_ENFORCE === "1",
    timeoutMs: num(process.env.JEV_ADVISOR_TIMEOUT_MS, 90000),
    goalPath: process.env.JEV_ADVISOR_GOAL ?? join(process.cwd(), "GOAL.md"),
  };
}

function safeJson<T>(value: T): string {
  try {
    return JSON.stringify(value ?? {}) ?? "{}";
  } catch {
    return "{}";
  }
}

function toolSig(name: string, argsText: string): string {
  return `${name} ${argsText}`.slice(0, 300);
}

function tailSame(records: TurnRecord[], count: number): boolean {
  if (records.length < count) return false;
  const tail = records.slice(-count);
  return tail.every((r) => r.sig === tail[0].sig);
}

function tailErrors(records: TurnRecord[], count: number): boolean {
  if (records.length < count) return false;
  return records.slice(-count).every((r) => r.error);
}

function codeLoop(records: TurnRecord[]): boolean {
  return tailSame(records, 4) || tailErrors(records, 3);
}

function boolProb(answer: JevBool | undefined): number {
  if (!answer) return 0;
  return answer.probability ?? answer.noul ?? 0;
}

function buildState(goal: string, prompt: string, records: TurnRecord[], flags: string[]): string {
  const turns = records
    .slice(-8)
    .map((r, i) => `${i + 1}. ${r.sig}${r.error ? " [ERROR]" : ""}`)
    .join("\n");
  const audit = flags.length > 0 ? flags.slice(-5).join("\n") : "none";
  return `GOAL\n${goal}\n\nPROMPT\n${prompt}\n\nRECENT TURNS\n${turns}\n\nAUDIT FLAGS\n${audit}`;
}

function bashFlag(command: string): string | null {
  for (const pattern of BASH_PATTERNS) {
    if (pattern.test(command)) return `bash matches ${pattern.source}`;
  }
  return null;
}

function pathFlag(path: string): string | null {
  if (SENSITIVE_PATH.test(path)) return `sensitive path: ${path}`;
  if (!resolve(path).startsWith(process.cwd() + sep)) return `outside cwd: ${path}`;
  return null;
}

function tripwireFlag(event: ToolCallEvent): string | null {
  if (isToolCallEventType("bash", event)) return bashFlag(event.input.command);
  if (isToolCallEventType("powershell", event)) return bashFlag(event.input.command);
  if (isToolCallEventType("write", event)) return pathFlag(event.input.path);
  if (isToolCallEventType("edit", event)) return pathFlag(event.input.path);
  return null;
}

function callJev(state: string, timeoutMs: number): Promise<JevAnswers> {
  const questions = readFileSync(join(HERE, "advisor-rubric.json"), "utf8");
  const payload = JSON.stringify({ state, questions: JSON.parse(questions) });
  return new Promise((resolvePromise, reject) => {
    const child = execFile(
      "node",
      [join(HERE, "jev-call.mjs")],
      { timeout: timeoutMs, maxBuffer: 1024 * 1024 },
      (error, stdout) => {
        if (error) reject(error);
        else resolvePromise(JSON.parse(stdout) as JevAnswers);
      },
    );
    child.stdin?.write(payload);
    child.stdin?.end();
  });
}

export default function (pi: ExtensionAPI): void {
  const config = loadConfig();
  const records: TurnRecord[] = [];
  const openCalls = new Map<string, number>();
  const auditFlags: string[] = [];
  let goal = "";
  let lastPrompt = "";
  let judgmentsUsed = 0;
  let loopStreak = 0;
  let lastVerdict = "none yet";
  let lastErrorAt = 0;
  let lastJudgedCount = 0;
  let lastJudgedErrors = 0;
  let lastFireTurn = -10;
  const STEER_COOLDOWN_TURNS = 3;

  function reportOnce(ctx: ExtensionContext, message: string): void {
    const now = Date.now();
    if (now - lastErrorAt < 60000) return;
    lastErrorAt = now;
    ctx.ui.notify(`jev-advisor: ${message}`, "error");
  }

  function fire(ctx: ExtensionContext, source: string, detail: string, turnIndex: number, steer: boolean): void {
    lastVerdict = `${source}: ${detail}`;
    pi.appendEntry("jev-advisor", { source, detail, turns: records.length });
    if (turnIndex - lastFireTurn < STEER_COOLDOWN_TURNS) return;
    lastFireTurn = turnIndex;
    ctx.ui.notify(`jev-advisor [${source}] ${detail}`, "warning");
    if (!steer) return;
    pi.sendMessage(
      {
        customType: "jev-advisor",
        content: `Advisor (${source}): ${detail} Re-read the goal and adjust before the next tool call.`,
        display: true,
      },
      { deliverAs: "steer" },
    );
  }

  function noteUncertain(detail: string): void {
    lastVerdict = detail;
    pi.appendEntry("jev-advisor", { source: "jev-uncertain", detail });
  }

  type Verdict = "fire" | "uncertain" | "ok";

  function canJudge(): boolean {
    return judgmentsUsed < config.budget && goal !== "" && records.length >= 2;
  }

  function stateMoved(): boolean {
    const errors = records.filter((r) => r.error).length;
    const moved = records.length !== lastJudgedCount || errors !== lastJudgedErrors;
    lastJudgedCount = records.length;
    lastJudgedErrors = errors;
    return moved;
  }

  function isFire(score: number, drift: number, loop: number): boolean {
    return score <= config.minScore || drift >= 0.7 || loop >= 0.7;
  }

  function isUncertain(score: number, drift: number, loop: number): boolean {
    return score <= 6 || drift >= 0.3 || loop >= 0.3;
  }

  function verdictOf(score: number, drift: number, loop: number): Verdict {
    if (isFire(score, drift, loop)) return "fire";
    if (isUncertain(score, drift, loop)) return "uncertain";
    return "ok";
  }

  function handleSafety(ctx: ExtensionContext, unsafe: number, conflict: number, turnIndex: number): void {
    if (unsafe >= 0.7) {
      fire(ctx, "jev-unsafe", `unsafe_action=${unsafe.toFixed(2)}`, turnIndex, true);
    }
    if (conflict >= 0.7) {
      fire(ctx, "jev-conflict", `goal_conflict=${conflict.toFixed(2)}`, turnIndex, false);
    }
  }

  function handleVerdict(ctx: ExtensionContext, verdict: Verdict, detail: string, turnIndex: number): void {
    if (verdict === "fire") {
      fire(ctx, "jev", detail, turnIndex, true);
    } else if (verdict === "uncertain") {
      noteUncertain(`jev uncertain: ${detail}`);
    } else {
      lastVerdict = `jev ok: ${detail}`;
      pi.appendEntry("jev-advisor", { source: "jev-ok", detail: lastVerdict });
    }
  }

  async function judgeTurn(ctx: ExtensionContext, turnIndex: number): Promise<void> {
    if (!canJudge()) return;
    if (!stateMoved()) return;
    judgmentsUsed += 1;
    try {
      const answers = await callJev(buildState(goal, lastPrompt, records, auditFlags), config.timeoutMs);
      const score = answers.on_track?.score ?? 10;
      const drift = boolProb(answers.drifting);
      const loop = boolProb(answers.looping);
      if (loop >= 0.7) loopStreak += 1;
      handleSafety(ctx, boolProb(answers.unsafe_action), boolProb(answers.goal_conflict), turnIndex);
      const detail = `on_track=${score}/10 drift=${drift.toFixed(2)} loop=${loop.toFixed(2)}`;
      handleVerdict(ctx, verdictOf(score, drift, loop), detail, turnIndex);
    } catch (error) {
      reportOnce(ctx, `judgment failed (${String(error).slice(0, 120)})`);
    }
  }

  pi.on("session_start", (_event, ctx) => {
    if (existsSync(config.goalPath)) {
      goal = readFileSync(config.goalPath, "utf8").slice(0, 4000);
    }
    ctx.ui.notify(
      `jev-advisor on (every ${config.every}, budget ${config.budget}, goal ${goal ? "loaded" : "MISSING — loop watch only"}, auditor shadow)`,
      "info",
    );
  });

  pi.on("tool_execution_start", (event: ToolExecutionStartEvent) => {
    openCalls.set(event.toolCallId, records.length);
    records.push({ sig: toolSig(event.toolName, safeJson(event.args)), error: false });
  });

  pi.on("tool_execution_end", (event: ToolExecutionEndEvent) => {
    const index = openCalls.get(event.toolCallId);
    if (index !== undefined) records[index].error = event.isError;
  });

  pi.on("turn_end", async (event: TurnEndEvent, ctx) => {
    try {
      if (records.length === 0) return;
      if (codeLoop(records)) {
        loopStreak += 1;
        fire(ctx, "code", `repeat/error loop (streak ${loopStreak})`, event.turnIndex, true);
        return;
      }
      if (event.turnIndex % config.every === 0) {
        await judgeTurn(ctx, event.turnIndex);
      }
    } catch (error) {
      reportOnce(ctx, `turn handler failed (${String(error).slice(0, 120)})`);
    }
  });

  function shadowAudit(event: ToolCallEvent, ctx: ExtensionContext): void {
    const flag = tripwireFlag(event);
    if (!flag) return;
    auditFlags.push(flag);
    ctx.ui.notify(`jev-advisor [shadow] would flag: ${flag}`, "warning");
    pi.appendEntry("jev-audit-shadow", { flag });
  }

  function enforceVerdict(event: ToolCallEvent): { block: true; reason: string } | undefined {
    if (!config.enforce || loopStreak < 2 || records.length === 0) return undefined;
    if (toolSig(event.toolName, safeJson(event.input)) === records[records.length - 1].sig) {
      return { block: true, reason: "jev-advisor: same call repeated on a loop streak — do something different" };
    }
    return undefined;
  }

  pi.on("before_agent_start", (event: BeforeAgentStartEvent) => {
    lastPrompt = event.prompt.slice(0, 1000);
  });

  pi.on("tool_call", async (event: ToolCallEvent, ctx) => {
    shadowAudit(event, ctx);
    return enforceVerdict(event);
  });

  pi.registerCommand("advisor", {
    description: "Show jev-advisor status",
    handler: async (_args, ctx) => {
      ctx.ui.notify(
        `turns=${records.length} judgments=${judgmentsUsed}/${config.budget} streak=${loopStreak} last=${lastVerdict}`,
        "info",
      );
    },
  });
}
