# TEMPER v2

> **Detect harm between messages, not inside them.**

TEMPER is a persistent moderation Mind for creator communities. It detects
**emergent harm** — harmful social behaviour that does not exist inside any
single message, but emerges across multiple interactions over time.

## Problem

Five safe messages can still form one harmful interaction.

A traditional moderation system evaluates messages independently and returns:

```
SAFE  SAFE  SAFE  SAFE  SAFE
```

But when five different members direct those same five messages at one newcomer
within ninety seconds, the collective interaction is a dogpile — even though no
individual message violates a rule.

## Insight

Moderation systems evaluate **messages**. Communities operate through
**relationships**.

## Product

TEMPER combines deterministic interaction structure with **persistent community
memory (Minds)** to distinguish friendly banter from collective pressure,
intervene proportionally, return later to measure the outcome, and learn from
the result.

## Proof

> Same words. Same pattern. Different history.

Maya (2 days in the community, no relationship history) and Chris (8 months,
extensive reciprocal history) receive the **identical** five messages from the
**identical** five members. TEMPER returns **DOGPILE** for Maya and **BANTER**
for Chris. The only difference is persistent history.

## Architecture

```
Observer → Convergence → Mind → Decision → Intervention → Incident → Follow-up → Memory
```

| Stage | Responsibility |
| --- | --- |
| Observer | Capture Telegram replies/mentions as interaction events |
| Convergence | Detect N unique sources → one target within a window (deterministic) |
| Mind | Interpret the signal using persistent community memory (Minds) |
| Decision | BANTER / OBSERVE / DOGPILE |
| Intervention | Gentle group redirect (the only autonomous MVP action) |
| Incident | OPEN → OBSERVING → RECOVERED / ESCALATING |
| Follow-up | Re-evaluate after the intervention |
| Memory | Persist the outcome back into agent context |

## Demo

Three dashboard views:

1. **Live incident** — legacy feed (all SAFE), the 5 → 1 convergence graph, and
   the TEMPER Mind verdict.
2. **Maya vs Chris** — the central contrast, side by side.
3. **Recovery** — incident outcome and seeded demo metrics.

The golden path runs offline using a deterministic, clearly-labelled local
evaluator, so the demo never depends on random LLM behaviour.

## Getting started

Requirements: **Node.js 22+**.

```bash
npm install
cp .env.example .env        # DEMO_MODE=true by default
npm run seed                # seed the controlled demo dataset
npm run dev                 # http://localhost:3000
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run seed` | Seed the demo dataset into SQLite |
| `npm run followup` | Run autonomous follow-up on open incidents |

## Configuration

See `.env.example`. With `DEMO_MODE=true` and no Minds credentials, the
deterministic evaluator powers the contrast. Set `MINDS_API_URL` +
`MINDS_API_KEY` to use the real Minds client, and `TELEGRAM_BOT_TOKEN` to enable
the live Telegram observer. When Minds is unavailable at runtime, TEMPER returns
**OBSERVE** and never intervenes — it never fabricates a verdict.

## MVP scope

The hackathon MVP implements exactly one emergent-harm pattern — **dogpile
detection** — and nothing else. See `Temper.PRD` for the locked scope and
explicit non-goals.

## Structure

```
app/            Next.js App Router pages + API routes
components/     Dashboard (3 views) + shared UI
lib/            domain logic (minds, telegram, convergence, incidents, db, demo)
scripts/        seed + follow-up runners
docs/           architecture documentation
```
