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
| `open_event` | `oev_` | name, slug (unique), year, status (`draft`\|`live`\|`closed`), weightUnit (`lb`\|`kg`, default `lb`), showIndividuals (bool, default true), coachPointsEnabled (bool, default false), coachScoresEnabled (bool, default false), autoRosterCoaches (bool, default true; migration 0015) |
| `open_week` | `owk_` | eventId, number, label, startsAt?, lockedAt? · unique(eventId, number) |
| `open_team` | `otm_` | eventId, name, slug, color?, sortOrder · unique(eventId, slug) |
| `open_team_coach` | `otc_` | teamId, coachId · unique(teamId, coachId) |
| `open_participant` | `opp_` | name, email?, userId? (FK user), coachId? (FK coach, unique, set null; migration 0015) — the same person as that coach profile, gender? (`male`\|`female`; migration 0016) |
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
- Rule `cadence` can't change once the rule has awards; workout `scoreType`/`repsPerRound`/`timeCapSeconds` can't change once it has scores.
- Retire rules via `isActive`, not delete; deleting a rule/week/team/scaling/workout with dependent rows fails. A week with workouts can't be deleted (move or delete its workouts first; no silent set-null).
- An event can only be deleted while it is `draft` AND has no entries.
- Removing an entry from an event never deletes the participant (a person outlives an event). Without `force` it fails if the entry has awards/scores; with `force` it deletes exactly the loaded awards/scores (each audited) and the entry delete is guarded against rows added meanwhile.
- A week is locked iff `lockedAt IS NOT NULL` (locks coach edits; admins unaffected).
- Award `dedupeKey` is always computed by `awardDedupeKey({ cadence, weekId })` (`src/lib/open/awards.ts`): `per_week` → weekId, `once_per_event` → `"event"`, `unlimited` → null. Weekly rules require a week; once-per-event rules take none. `setAward` / `setAwardsForEntries` toggle only keyed (`per_week` / `once_per_event`) rules; `unlimited` awards go only through `addUnlimitedAward` / `removeAward`.
- Permission checks are split (`src/server/open/permissions.ts` + pure `src/lib/open/permissions.ts`): `loadManageContext({ session, eventId, kind, ruleId?, weekId?, workoutId?, scalingId? })` loads + validates all referenced rows and the session's manageable team ids in one `db.batch` (pure `decideManageContext`); then `decideManageEntry({ context, entry })` / `assertEntryInContext` checks each entry. Bulk writers load entries by eventId (never `inArray` with large id lists — D1 caps bound params at ~100). Single-entry actions use `assertCanManageEntry({ eventId, entryId, … })` (an entry outside `eventId` is not found). Admin rights come only from `isOpenAdmin(session)`. Score checks take no weekId: the lock week is the workout's week.
- Team points follow the entry's current `teamId` (moving an athlete moves their points) — intentional.
- Audit rows: `action` is the verb; written in the same `db.batch` as the change; never updated/deleted. Delete audits are conditional (`INSERT … SELECT … WHERE EXISTS (row)`, placed before the delete) so a repeated delete audits once.
- Guarded updates/deletes (`auditedUpdate` / `auditedDelete` in `src/server/open/write.ts`): the guard goes in the UPDATE/DELETE `WHERE` and the conditional audit; 0 rows changed ⇒ friendly error, nothing written. Used for: score edits (`updateCounter` optimistic lock), rule cadence changes (`NOT EXISTS` awards), workout score-shape changes (`NOT EXISTS` scores), week delete (`NOT EXISTS` workouts), event delete (draft + `NOT EXISTS` entries), entry removal (`NOT EXISTS` awards/scores).

## Pure modules (`src/lib/open/`)
- `score-codec.ts`: `parseScore({input, workout})`, `formatScore({score, workout, weightUnit})`, `compareScores({a, b, workout})` — ranking: scaling rank asc → (time) finished before capped → score (time asc / others desc / capped reps desc) → tiebreak asc.
- `standings.ts`: `computeStandings({teams, entries, awards})` → per-team totals, member counts, avg per member, per-week breakdown, per-rule breakdown, top individuals.

## Server reads (`src/server/open/`, `server-only`)
events, weeks, teams, rules, entries, scalings, workouts, scores, awards, standings (single grouped queries; feed the pure functions), `permissions.ts`:
- `getManageableTeams({session, eventId})` → all teams if `isOpenAdmin(session)`, else teams where the user's linked coach is assigned.
- `loadManageContext` + `assertEntryInContext` (bulk) / `assertCanManageEntry` (single) — see Write invariants. Coaches additionally need: entry's team in their manageable teams, event flag (`coachPointsEnabled`/`coachScoresEnabled`), week not locked, (points ⇒ rule.coachAwardable AND rule.isActive).
- `getStandings({eventId})` (cached, tag `openEventTag({eventId})` = `open:<eventId>`) — public pages read it through `loadEventBoard` (`src/app/(open)/open/_lib/`), the one place individuals are dropped when the (uncached) event row has `showIndividuals` false, and where both team ranks (total, avg per member) are computed once.

## Actions (`src/actions/open/*.action.ts`, zsa)
- Admin config (requireAdmin): events CRUD (+ seed scalings), weeks, teams, team coaches, rules, scalings, workouts, roster (`importRoster` paste names; `assignTeam`/`bulkAssignTeams`), coach ↔ user link.
- Shared (permission-checked): `setAward({entryId, ruleId, weekId, awarded, note})` idempotent; `setAwardsForEntries({ruleId, weekId?, entryIds, awarded})` bulk delta — applies `awarded` to exactly `entryIds` (the grid's visible athletes, each permission-checked; nothing else touched), idempotent, chunked, one `db.batch` with audits (pure plan: `planAwardDelta` in `src/lib/open/award-diff.ts`); `setScore({entryId, workoutId, input, scalingId, tiebreak?, note?})`; `clearScore`.
- Award actions revalidate even on a no-op (a no-op usually means the caller's view was stale).
- Every write `revalidateTag(openEventTag({ eventId }))` (`open:<eventId>`, from `src/lib/open/cache-tags.ts`) / revalidatePath as appropriate.
- Every mutation writes one `open_audit_log` row in the same `db.batch` as the change, via a single `writeAudit`/`auditStatement` helper.

## Routes
Admin (`src/app/(admin)/admin/open/...`, existing requireAdmin layout; add "Open" sidebar item):
- `/admin/open` events list/create
- `/admin/open/[slug]` overview (standings preview, links)
- `.../weeks`, `.../teams` (incl. coach assignment), `.../participants`, `.../rules`, `.../scalings`, `.../workouts`, `.../settings` (status, flags, weightUnit, showIndividuals)
- `.../audit` — filterable audit log (actor, entityType, entityId)
- `.../points` and `.../scores` → shared grids, all teams
- `/admin/coaches` gets "Linked user" picker

Coach workspace (`src/app/(open)/open/[slug]/manage/...`, session required):
- layout resolves manageable teams; empty ⇒ redirect
- `manage` team picker (skip when one) · `manage/[teamSlug]/points` · `manage/[teamSlug]/scores`

Public (`src/app/(open)/open/...`):
- `/open` → redirect to live event (or list)
- `/open/[slug]` team standings (total + avg toggle via `?sort=avg`), week-by-week, rules explainer (active rules + retired rules that carry awards, labeled), top individuals if showIndividuals
- `/open/[slug]/tv` big-screen standings (no site chrome, 60s meta refresh, `?sort=avg`); `/open/[slug]?tv=1` redirects there
- `/open/[slug]/teams` team cards; `/open/[slug]/workouts` workout list
- Only `live`/`closed` events are public; `draft` 404s except for admins ("Draft preview" banner, noindex). When `showIndividuals` is false, workout leaderboards and per-athlete points/scores are hidden with a note.
- `/open/[slug]/teams/[teamSlug]` roster + history + scores (see "Coaches compete" for member/coach display rules)
- `/open/[slug]/workouts/[workoutSlug]` combined ranked leaderboard, filter by scaling

Shared components: `src/components/open/award-grid.tsx`, `score-grid.tsx` (props-driven, no knowledge of admin vs coach).

## Team profiles (added after Stage 3)
- Migration 0014: `open_team` gains `photoKey` (R2 object key, nullable), `motto` (nullable), `description` (nullable).
- R2 binding `OPEN_MEDIA` → bucket `crossfit-canvas-open` (bucket creation pending: R2 must be enabled on the account; local dev uses miniflare R2).
- Upload: route handler `POST /api/open/team-photo` (multipart `eventId`, `teamId`, `file`) — a route handler rather than a server action so the global server-action body limit (1 MB) stays untouched. Before reading the body it enforces same-origin (`Origin` host = `x-forwarded-host`/`host`; route handlers lack server-action CSRF protection) and a `Content-Length` cap (5 MB + 64 KB multipart overhead); then requires a session and calls the one shared `uploadTeamPhoto` (`src/server/open/team-photo.ts`): validates type (jpeg/png/webp, declared type must match magic bytes) and size (≤ 5 MB), `put`s the File (no buffering) to `open/teams/<teamId>/<random>.<ext>`, updates `photoKey` (audited, guarded on the previously loaded `photoKey`), deletes the old object after the DB write succeeds; if the DB write fails the new object is deleted. `updateTeamProfile` (motto ≤ 140, description) and `removeTeamPhoto` are zsa actions.
- Served by `/open/media/[...key]` (only keys under `open/`) with immutable cache headers (keys are never overwritten), ETag/304, `nosniff`, and `Content-Security-Policy: default-src 'none'; sandbox`. `media` is a reserved event slug (`resolveEventSlug` in `src/lib/open/event-slug.ts` owns slug derivation + reserved slugs).
- Photo cleanup on deletes: team delete and event delete collect the affected `photoKey`s before the batch and best-effort delete the R2 objects after it succeeds (failures logged; an orphaned object is harmless).
- Profile permission (`decideManageTeam` / `assertCanManageTeam`, separate from entry-level points/scores): admins edit everything on any team in the event (name, slug, color via the admin-only teams action; photo, motto, description via the profile actions); coaches edit photo/motto/description of teams they coach only. A team outside the request's event is "not found". Profile edits are not gated by event flags or week locks.
- Public: `/open/[slug]/teams` (grid: photo, name, motto, rank, total, member count) and `/open/[slug]/teams/[teamSlug]` (header with photo/name/motto/rank/total; coaches with existing coach photos/bios; roster with points and scores; week-by-week history).

## Coaches compete (added after Stage 6)
- Person-level link: `open_participant.coachId` (nullable, unique, FK coach, `ON DELETE set null` appended by hand to drizzle's ALTER in 0015). A coach is the same person across events, so the link lives on the participant, not the entry.
- "Coach of this team" is derived, never stored: participant.coachId ∈ that team's `open_team_coach` coachIds (`sortRoster` in `src/lib/open/public-view.ts`). A coach on the roster of a team they don't coach shows as a regular member there. Their entry is just an entry: standings totals are unchanged.
- Admin: the Participants edit dialog links/unlinks a coach profile through `updateOpenEntry` (`coachId`; name/email/coach link on the participant, team/division on the entry; one batch, one audit per changed entity; one participant per coach, friendly error). Linked participants show a "Coach profile" badge (the person link, not team-coach status). `addCoachToRoster({ eventId, teamId, coachId })` (Teams page button per assigned coach not on that roster): reuses the coach's linked participant or creates one named after the coach, then creates the entry or moves it to the team. Roster import reuses linked participants through the normal name/email matching (no coach-name matching).
- `autoRosterCoaches` (event setting, default on): assigning a coach to a team also enters them on that team in the same batch; an existing entry on another team is never moved (the action returns a note the UI toasts). Turning the setting on (Settings save) runs the backfill: every assigned coach without an entry gets one on their first assigned team (by sortOrder); coaches already entered on any team they coach are skipped silently; only coaches entered on a team they don't coach get a note. It runs in its own batch after the settings write commits (revalidated before and after); a backfill failure is returned as a note ("Settings saved; adding coaches failed: …"), not thrown — re-saving off → on retries it. No data migration for existing events (none are deployed yet); the column default is on. Unassigning never removes the entry. One planner for all three paths: pure `planCoachRoster` / `backfillCoachRequests` (`src/lib/open/coach-roster.ts`); one writer: `coachRosterStatements` (`src/server/open/coach-roster.ts`). An unlinked athlete in the event with the coach's name blocks creation with a "link them" note (no duplicate person).
- Public display (`buildTeamRosters`, from standings individuals + `getPublicEventData` team coaches/entry coach links — the one place coach-ness is derived for the leaderboard, teams grid, coach cards, and roster badges; display fields plus a server-only `entryId` for score lookups, no coach ids/emails):
  - Leaderboard: each team row expands (`<details>`, no JS) into members sorted by points desc, then name, each with points and a Coach badge, plus the team total.
  - Teams grid: coaches (photo via `getCoachPhoto`, name, points if on that roster) and the other members with points. Team profile: coach cards say "Competing on this team" + points; roster sorted the same way with Coach badges.
  - `showIndividuals` false: names and Coach badges still show, but no per-person points and alphabetical order; team totals still shown.
- Coach entry point: public event pages (not TV) show "Manage my team" / "Manage teams" (signed-in viewer with ≥1 manageable team; `loadManageLink`) or a subtle "Coach sign in" (`manageSignInHref`, the same URL the workspace's sign-in redirect uses). The workspace header links back to the public page.

## Placement points (added after "Coaches compete")
- Derived from scores, never stored (no ledger rows, nothing to keep in sync). Pure `computePlacements` (`src/lib/open/placement.ts`); `getStandings` loads workouts/scalings/scores/genders in the same batch, feeds placements into `computeStandings` (totals, `byWeek` via the workout's week, `byWorkout`), and returns `placements` for the workout leaderboard's "+N pts".
- Per workout × scaling × gender, scores rank gym-wide with `rankScores` (ties share a place). Place p earns `max(first − step × (p − 1), min)`. Only each team's top `placementPerTeam` athletes per gender (by place; ties at the cutoff all count; 0 = everyone) earn points; the rest keep their place and earn 0. No gender ⇒ not ranked; no team ⇒ ranked, 0 points. Scaling with `placementFirst` 0 ⇒ no placement.
- Defaults: Rx 100/−5/min 5/top 3, Scaled 50/−5/min 5/top 2, Foundations off. Copied from the previous event like the rest of the scaling.
- Gender is a person fact (participant), edited inline on Participants or in the edit dialog via `updateOpenEntry`.

## Stages
1. Schema + migration + seeds
2. Pure modules + server reads + permissions
3. Actions
4a. Team profiles backend (migration 0014, R2 binding, upload + media route, profile permission)
4b. Admin UI (incl. audit log view and team profile editor)
5. Coach workspace (manage routes + shared grids)
6. Public leaderboard
Each stage ends with: `npx tsc --noEmit`, `pnpm lint`, an uncomplect review, fixes, commit.
