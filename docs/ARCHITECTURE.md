# TEMPER — Architecture

TEMPER is a persistent moderation Mind for creator communities. This document
describes the runtime architecture and the decision loop.

## Separation of concerns

The architecture deliberately separates two responsibilities (PRD section 6):

### Deterministic signal layer

Plain application code detects **structure**:

- how many unique users replied to the same target
- within what time window
- how fast the convergence is happening

This layer answers *"something unusual may be happening"*. It never decides what
the interaction **means**.

### Persistent meaning layer

The TEMPER Mind (Minds) evaluates the signal against historical community
context: tenure, reciprocity, established banter, comparable precedents, prior
disengagement. This layer decides `BANTER`, `OBSERVE`, or `DOGPILE`.

Without persistent context the system cannot distinguish the Maya scenario from
the Chris scenario, which makes Minds part of the core decision engine — not an
attachment.

## Data flow

```
Telegram group
      │ messages / replies
      ▼
Observer (lib/telegram/observer.ts)
      │ Interaction { source, target, timestamp, type }
      ▼
ConvergenceEngine (lib/convergence/detector.ts)
      │ ConvergenceSignal  (>=5 unique sources → 1 target, <=120s)
      ▼
EvidencePacket (lib/types.ts)
      ▼
TemperMind (lib/minds/client.ts)
      │ MindDecision { verdict, confidence, reason, action, followUpMinutes }
      ▼
Decision
   ├─ DOGPILE  → create Incident (open) → gentle redirect → OBSERVING
   ├─ BANTER   → create Incident → dismissed
   └─ OBSERVE  → create Incident → observing
      ▼
Incident Store (lib/incidents/service.ts, SQLite)
      ▼
Outcome Watcher (lib/incidents/follow-up.ts)
      │ RECOVERED / ESCALATING / OBSERVING
      ▼
Memory (Minds) — rememberOutcome()
```

## Convergence detection

Deterministic and configurable (PRD section 16):

- `minimumSources: 5`
- `convergenceWindowSeconds: 120`

Overridable via `CONVERGENCE_MIN_SOURCES` and `CONVERGENCE_WINDOW_SECONDS`. The
detector deduplicates repeated source members — each distinct member counts
once. It emits a signal only; the verdict is the Mind's responsibility.

## Decision contract

The Mind must return a structured JSON object (validated with Zod in
`lib/minds/schema.ts`):

```json
{
  "verdict": "dogpile",
  "confidence": 0.91,
  "reason": "The target is a two-day-old member with no established relationship history with the five converging members.",
  "action": "gentle_group_redirect",
  "follow_up_minutes": 180
}
```

An invalid or unavailable response is never treated as a verdict.

## Minds modes

| Mode | Trigger | Behaviour |
| --- | --- | --- |
| `minds` | `MINDS_API_URL` + `MINDS_API_KEY` set | Real HTTP calls to the Minds API |
| `deterministic-demo` | `DEMO_MODE=true` (default in dev) | Offline evaluator encoding the Maya/Chris rules |
| `unavailable` | neither | Returns `OBSERVE`; never intervenes |

The `source` field is surfaced to the UI so the demo never fabricates a real
Minds verdict.

## Storage

SQLite (`better-sqlite3`) stores deterministic application state:

- `members` — tenure, message counts
- `interactions` — reply/mention edges
- `convergence_signals` — raw structural events
- `incidents` — OPEN / OBSERVING / RECOVERED / ESCALATING / DISMISSED
- `incident_outcomes` — follow-up results

Minds remains the source of persistent **semantic** community context.

## Incident lifecycle

```
OPEN ──▶ OBSERVING ──▶ RECOVERED
            │
            └──────▶ ESCALATING
```

An incident stays open after intervention. The follow-up runner
(`npm run followup`, or the API) evaluates re-engagement, repeat convergence
and escalation, then persists the outcome and records it back into the Mind.

## Deterministic evaluator rules

The offline evaluator (`lib/minds/deterministic.ts`) encodes the PRD's
integration tests:

- Newcomer (tenure ≤ 7 days, ≤ 2 exchanges, 0 banter cases) → `dogpile`
- Established (tenure ≥ 30 days, ≥ 10 exchanges, ≥ 1 banter case) → `banter`
- Anything else → `observe`

## Failure handling

- **Minds unavailable** → `OBSERVE` only, no intervention.
- **Telegram delivery fails** → intervention stays pending, surfaced in the
  dashboard, never falsely marked as sent.
- **Insufficient history** → `OBSERVE`.
