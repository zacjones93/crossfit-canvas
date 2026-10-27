# CrossFit Open Event — Implementation Plan

Run a CrossFit Open intramural: X teams, arbitrary weekly point rules (costume, judging, attendance, …), optional workout scores, an admin dashboard, a coach workspace, and a public leaderboard.

Ported (and uncomplected) from `zacjones93/bcf-open-2025` (Supabase). Lessons from that repo:
- `point_types` mixed catalog + value + semantics → here: **rule** (catalog) vs **award** (fact, points snapshotted).
- Two ledgers (`point_assignments` + `athlete_points`) synced by trigger → here: **one ledger** (`open_award`); standings are always derived, never stored.
- Logic keyed on seeded UUID constants → here: no code depends on specific rule/scaling rows.
- `week_number CHECK 1..3`, no event concept → here: events contain N weeks, N teams.
- `athletes` mixed login + role + division → here: participant (person) / entry (person-in-event) / coach (profile w/ optional login).

## Principles (apply in every stage)
- One fact, one place. Derived values (standings, ranks, totals) are computed, never stored.
- Pure logic (score codec, ranking, standings shaping) lives in plain modules with no DB/`server-only` imports.
- One permission function decides who may mutate what; every action calls it. Never trust the route.
- Drizzle + D1: no transactions; use `db.batch([...])` for multi-statement writes. Never pass `id` on insert.
- Follow CLAUDE.md conventions: named-object params when >1 param, `import "server-only"` on server modules, zsa server actions, interfaces over types, maps over enums, Shadcn UI, mobile-first.

## Data model (`src/db/schema.ts`, namespaced `open_*` — `team` is the SaaS tenancy table)

| Table | Prefix | Columns |
|---|---|---|
| `coach` (existing) | — | **add** `userId` nullable FK → `user.id`, unique |
| `open_event` | `oev_` | name, slug (unique), year, status (`draft`\|`live`\|`closed`), weightUnit (`lb`\|`kg`, default `lb`), showIndividuals (bool, default true), coachPointsEnabled (bool, default false), coachScoresEnabled (bool, default false) |
| `open_week` | `owk_` | eventId, number, label, startsAt?, lockedAt? · unique(eventId, number) |
| `open_team` | `otm_` | eventId, name, slug, color?, sortOrder · unique(eventId, slug) |
| `open_team_coach` | `otc_` | teamId, coachId · unique(teamId, coachId) |
| `open_participant` | `opp_` | name, email?, userId? (FK user) |
| `open_entry` | `oen_` | eventId, participantId (restrict), teamId? (restrict — reassign before deleting a team), division? · unique(eventId, participantId) |
| `open_point_rule` | `opr_` | eventId, name, description?, points (int), cadence (`per_week`\|`once_per_event`\|`unlimited`), coachAwardable (bool, default true), sortOrder, isActive |
| `open_award` | `oaw_` | entryId (cascade), ruleId (restrict), weekId? (restrict), points (snapshot int), dedupeKey?, note?, awardedByUserId? · unique(entryId, ruleId, dedupeKey) · check(dedupeKey IS NULL OR dedupeKey = 'event' OR dedupeKey = weekId) |
| `open_scaling` | `osl_` | eventId, name, slug, rank (int, lower = better; also display order) · unique(eventId, slug) |
| `open_workout` | `owo_` | eventId, weekId?, name, slug, description?, scoreType (`time`\|`reps`\|`rounds_reps`\|`load`\|`points`), timeCapSeconds?, repsPerRound?, hasTiebreak (bool), sortOrder · unique(eventId, slug) |
| `open_score` | `osc_` | entryId, workoutId, scalingId, value (int, canonical), capped (bool), tiebreakMs?, note?, enteredByUserId? · unique(entryId, workoutId) |
| `open_audit_log` | `oal_` | eventId? (plain indexed text, no FK — survives event deletion), actorUserId? (FK user), action (`create`\|`update`\|`delete`), entityType (event, week, team, team_coach, coach, entry, participant, rule, scaling, workout, award, score), entityId, before? (JSON), after? (JSON), summary? · append-only; idx (eventId, createdAt), (entityType, entityId), (actorUserId) |

Deletes: event → all children cascade; entry → awards/scores cascade; team_coach cascades from team & coach; user FKs set null. Everything else restricts, so history is never silently destroyed.

Enum value maps (`OPEN_EVENT_STATUS`, `OPEN_WEIGHT_UNIT`, `OPEN_RULE_CADENCE`, `OPEN_SCORE_TYPE`, `OPEN_AUDIT_VERB`, `OPEN_AUDIT_ENTITY`) live in `src/lib/open/constants.ts` (plain module); `src/lib/open/defaults.ts` holds `DEFAULT_OPEN_SCALINGS` / `DEFAULT_OPEN_RULES`.

Canonical `open_score.value`: time → ms; time & capped → reps; reps → count; rounds_reps → total reps (rounds × repsPerRound + reps); load → grams; points → int.

Award cadence: `open_award.dedupeKey` (text, nullable) is set by the one award-writing function from the rule's cadence — `per_week` → weekId (weekId required), `once_per_event` → `"event"` (weekId null), `unlimited` → null. A single plain unique index on (entryId, ruleId, dedupeKey) enforces it; SQLite treats NULLs as distinct, so unlimited awards may repeat.

Scaling levels are data: seed every new event with Rx (rank 0), Scaled (1), Foundations (2); new events copy the previous event's scalings if any. Also provide dev/prod seed scripts.

## Write invariants (Stage 3 actions must enforce)
- All ids referenced by a mutation (entry, rule, week, team, workout, scaling) must belong to the same event; validate in the action/permission layer.
- Rule `cadence` can't change once the rule has awards; workout `scoreType`/`repsPerRound` can't change once it has scores.
- Retire rules via `isActive`, not delete; deleting a rule/week/team/participant with dependent rows fails.
- A week is locked iff `lockedAt IS NOT NULL` (locks coach edits; admins unaffected).
- Team points follow the entry's current `teamId` (moving an athlete moves their points) — intentional.
- Audit rows: `action` is the verb; written in the same `db.batch` as the change; never updated/deleted.

## Pure modules (`src/lib/open/`)
- `score-codec.ts`: `parseScore({input, workout})`, `formatScore({score, workout, weightUnit})`, `compareScores({a, b, workout})` — ranking: scaling rank asc → (time) finished before capped → score (time asc / others desc / capped reps desc) → tiebreak asc.
- `standings.ts`: `computeStandings({teams, entries, awards})` → per-team totals, member counts, avg per member, per-week breakdown, per-rule breakdown, top individuals.

## Server reads (`src/server/open/`, `server-only`)
events, weeks, teams, rules, entries, scalings, workouts, scores, awards, standings (single grouped queries; feed the pure functions), `permissions.ts`:
- `getManageableTeamIds({userId, eventId})` → all teams if admin, else teams where the user's linked coach is assigned.
- `canManageEntry({userId, entryId, kind: "points" | "scores", ruleId?, weekId?})` → admin ⇒ true; else coach on entry's team AND event flag (`coachPointsEnabled`/`coachScoresEnabled`) AND week not locked AND (points ⇒ rule.coachAwardable).

## Actions (`src/actions/open/*.action.ts`, zsa)
- Admin config (requireAdmin): events CRUD (+ seed scalings), weeks, teams, team coaches, rules, scalings, workouts, roster (`importRoster` paste names; `assignTeam`/`bulkAssignTeams`), coach ↔ user link.
- Shared (permission-checked): `setAward({entryId, ruleId, weekId, awarded, note})` idempotent; `setAwardsForRuleWeek({ruleId, weekId, entryIds})` diff + `db.batch`; `setScore({entryId, workoutId, input, scalingId, tiebreak?, note?})`; `clearScore`.
- Every write `revalidateTag("open:<eventSlug>")` / revalidatePath as appropriate.
- Every mutation writes one `open_audit_log` row in the same `db.batch` as the change, via a single `writeAudit`/`auditStatement` helper.

## Routes
Admin (`src/app/(admin)/admin/open/...`, existing requireAdmin layout; add "Open" sidebar item):
- `/admin/open` events list/create
- `/admin/open/[slug]` overview (standings preview, links)
- `.../weeks`, `.../teams` (incl. coach assignment), `.../participants`, `.../rules`, `.../scalings`, `.../workouts`, `.../settings` (status, flags, weightUnit, showIndividuals)
- `.../audit` — filterable audit log (actor, entity type, week, team)
- `.../points` and `.../scores` → shared grids, all teams
- `/admin/coaches` gets "Linked user" picker

Coach workspace (`src/app/(open)/open/[slug]/manage/...`, session required):
- layout resolves manageable teams; empty ⇒ redirect
- `manage` team picker (skip when one) · `manage/[teamSlug]/points` · `manage/[teamSlug]/scores`

Public (`src/app/(open)/open/...`):
- `/open` → redirect to live event (or list)
- `/open/[slug]` team standings (total + avg toggle), week-by-week, rules explainer, top individuals if showIndividuals; `?tv=1` big-screen mode
- `/open/[slug]/teams/[teamSlug]` roster + history + scores
- `/open/[slug]/workouts/[workoutSlug]` combined ranked leaderboard, filter by scaling

Shared components: `src/components/open/award-grid.tsx`, `score-grid.tsx` (props-driven, no knowledge of admin vs coach).

## Stages
1. Schema + migration + seeds
2. Pure modules + server reads + permissions
3. Actions
4. Admin UI
5. Coach workspace (manage routes + shared grids)
6. Public leaderboard
Each stage ends with: `npx tsc --noEmit`, `pnpm lint`, an uncomplect review, fixes, commit.
