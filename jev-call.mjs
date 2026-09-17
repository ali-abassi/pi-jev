// Thin bridge: pi extension -> Jev judgment. Never prints secrets.
// Usage: echo '{"state": "...", "questions": {...}}' | node jev-call.mjs
// Prints the answers object as JSON. Exit non-zero on failure.
//
// JEV_GATEWAY_DIR points at a TypeSafe harness dir containing jev.mjs
// (exporting judge({state, questions})) — see README for the interface.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const GATEWAY = process.env.JEV_GATEWAY_DIR ?? '/Users/aliabassi/.pi-x/agent/tools/ai-gateway';
const { judge } = await import(join(GATEWAY, 'jev.mjs'));

const AGENT_ENV = join(GATEWAY, '..', '..', '.env');

function loadEnv() {
  if (!existsSync(AGENT_ENV)) return;
  for (const line of readFileSync(AGENT_ENV, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

function readStdin() {
  return readFileSync(0, 'utf8');
}

loadEnv();
const { state, questions } = JSON.parse(readStdin());
const result = await judge({ state, questions });
// Direct route wraps in {latencyMs, model, answers}; unwrap to answers.
process.stdout.write(JSON.stringify(result.answers ?? result));
