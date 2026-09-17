# pi-jev — a Jev advisor for the pi coding agent

Run stock [pi](https://pi.dev) with a judgment-model advisor watching every
turn: free code-level loop detection plus cheap Jev verdicts on goal
alignment. Advisory-first: notify + steer message on fire, durable receipts
in the session. Fails open on every error path.

## Quick start

Requirements: [pi](https://pi.dev) ≥ 0.85, node ≥ 20, and a judge backend
(see below).

```sh
git clone https://github.com/ali-abassi/pi-jev.git
cd pi-jev
npm install
cp ~/.pi/agent/auth.json vanilla/auth.json   # reuse your pi credentials
echo 'Ship the widget without breaking the build.' > myproject/GOAL.md
cd myproject
PI_CODING_AGENT_DIR=../pi-jev/vanilla JEV_ADVISOR_EVERY=3 \
  pi -e ../pi-jev/jev-advisor.ts
```

Or install the launcher (below) and just run `pi-jev` in any project.

## Layout

- `jev-advisor.ts` — the extension (strict tsc-clean)
- `advisor-rubric.json` — `on_track` score + `drifting` / `looping` booleans
- `jev-call.mjs` — judge bridge: stdin `{state, questions}` → stdout answers
- `vanilla/` — stock `PI_CODING_AGENT_DIR` (never commit `auth.json`)
- `sandbox/` — demo project with a `GOAL.md`

`/advisor` in interactive mode prints turns / judgments / streak / verdict.

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

Fire thresholds: score ≤ min, drift/loop ≥ 0.70. Uncertain band
(score ≤ 6, probs 0.30–0.70) logs a receipt without steering.
Steer messages cool down to one per 3 turns; unchanged states are not
re-judged.

## Checks

```sh
npm run typecheck   # strict tsc over the extension
```

## License

MIT.
