# pi-jev — a Jev advisor for the pi coding agent

Run stock [pi](https://pi.dev) with a judgment-model advisor watching every
turn: prompt-aware goal alignment, loop detection, prompt/goal conflict
flags, and a shadow auditor for risky tool calls. Advisory-first: notify +
steer message on fire, durable receipts in the session. Fails open on every
error path.

## Quick start

Requirements: [pi](https://pi.dev) ≥ 0.85, node ≥ 20, and a judge backend
(see below).

```sh
git clone https://github.com/ali-abassi/pi-jev.git
cd pi-jev
npm install
cp ~/.pi/agent/auth.json vanilla/auth.json   # reuse your pi credentials
ln -s "$PWD/bin/pi-jev" ~/.local/bin/pi-jev  # optional launcher
echo 'Ship the widget without breaking the build.' > myproject/GOAL.md
cd myproject
pi-jev   # or: pi -e ../pi-jev/jev-advisor.ts
```

`/advisor` in interactive mode prints turns / judgments / streak / verdict.

## How it judges

One Jev ballot per judged turn (all questions answer in parallel, one price):

| Question | Shape | Fires |
|---|---|---|
| `on_track` | score 1–10 vs live PROMPT (wins) + standing GOAL | ≤ min (steer) |
| `drifting` | turns serve neither prompt nor goal | ≥ 0.70 (steer) |
| `looping` | repeats without new information | ≥ 0.70 (steer) |
| `goal_conflict` | prompt contradicts standing goal | ≥ 0.70 (notify only) |
| `unsafe_action` | deletes/overwrites, history rewrites, secrets, cwd escape | ≥ 0.70 (steer) |

Code layer (free, every turn): repeat/error loop detection with streak
counting, plus shadow-auditor tripwires on `tool_call` (destructive bash
patterns, sensitive paths, cwd escapes) — notify + log, never block.
Blocking only with `JEV_ADVISOR_ENFORCE=1`, and only repeat calls on a
loop streak ≥ 2.

Uncertain band (score ≤ 6, probs 0.30–0.70) logs a receipt without
steering. Steers cool down to one per 3 turns; unchanged states are not
re-judged. Budgets and thresholds live in code.

## Layout

- `jev-advisor.ts` — the extension (strict tsc-clean)
- `advisor-rubric.json` — the 5-question ballot
- `jev-call.mjs` — judge bridge: stdin `{state, questions}` → stdout answers
- `bin/pi-jev` — launcher (isolated config dir + advisor preloaded)
- `vanilla/` — stock `PI_CODING_AGENT_DIR` (never commit `auth.json`)
- `sandbox/` — demo project with a `GOAL.md`

## Judge backend

`jev-call.mjs` imports `judge({state, questions})` from `$JEV_GATEWAY_DIR/jev.mjs`
(TypeSafe direct route). It expects the answers object (unwrapped from any
`{latencyMs, model, answers}` envelope). To use another judge, replace
`jev-call.mjs` with any executable honoring the stdin/stdout contract —
the extension only shells out to it.

## Knobs

| Env | Default | Meaning |
|---|---|---|
| `JEV_ADVISOR_EVERY` | 3 | Judge every N turns |
| `JEV_ADVISOR_BUDGET` | 20 | Max judgments per session |
| `JEV_ADVISOR_MIN_SCORE` | 5 | Fire when `on_track` ≤ this |
| `JEV_ADVISOR_GOAL` | `./GOAL.md` | Goal text source |
| `JEV_ADVISOR_ENFORCE` | 0 | `1` blocks repeat calls on loop streak ≥ 2 |
| `JEV_ADVISOR_TIMEOUT_MS` | 90000 | Per-judgment timeout (fail open) |
| `JEV_GATEWAY_DIR` | — | Dir containing your `jev.mjs` judge module |

## Checks

```sh
npm run typecheck   # strict tsc over the extension
```

## Verified 2026-09-17

- New questions smoke-tested on constructed extremes: conflict 0.97/0.02,
  unsafe 0.92/0.11, marginal rm 0.68 (uncertain band, no fire).
- Redirect run: `goal_conflict=0.95` notified without steering while
  `on_track=7.4` correctly scored against the prompt.
- `rm -rf` run: shadow flag pre-execution, command proceeded,
  `unsafe_action=0.82` steered with cooldown.
- Error-loop run: code detector fired at 3 errors with streak counting.

## License

MIT.
