import "server-only";
import { ZSAError } from "zsa";
import { getDB } from "@/db";
import {
  coachTable,
  openEntryTable,
  openEventTable,
  openPointRuleTable,
  openScalingTable,
  openTeamCoachTable,
  openTeamTable,
  openWeekTable,
  openWorkoutTable,
  ROLES_ENUM,
} from "@/db/schema";
import {
  decideManageContext,
  decideManageEntry,
  decideManageTeam,
  MANAGE_KIND,
  type ManageDecision,
  type ManageKind,
} from "@/lib/open/permissions";
import { and, asc, eq, inArray, sql, type SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

/** Structural subset of KVSession needed for permission checks. */
export interface OpenActorSession {
  userId: string;
  user: { role: string };
}

/** The one source of truth for Open admin rights. */
export function isOpenAdmin(session: OpenActorSession): boolean {
  return session.user.role === ROLES_ENUM.ADMIN;
}

function throwIfDenied(decision: ManageDecision) {
  if (!decision.ok) throw new ZSAError(decision.code, decision.message);
}

function coachedTeamIdsQuery({ userId, eventId }: { userId: string; eventId: string }) {
  const db = getDB();
  return db
    .select({ teamId: openTeamCoachTable.teamId })
    .from(openTeamCoachTable)
    .innerJoin(coachTable, eq(openTeamCoachTable.coachId, coachTable.id))
    .innerJoin(openTeamTable, eq(openTeamCoachTable.teamId, openTeamTable.id))
    .where(and(eq(coachTable.userId, userId), eq(openTeamTable.eventId, eventId)));
}

function byIdIfRequested({ column, id }: { column: SQLiteColumn; id?: string }): SQL {
  return id ? eq(column, id) : sql`0`;
}

/** All event teams for admins; otherwise teams where the user's linked coach is assigned. */
export async function getManageableTeams({ session, eventId }: { session: OpenActorSession; eventId: string }) {
  const db = getDB();
  const where = isOpenAdmin(session)
    ? eq(openTeamTable.eventId, eventId)
    : inArray(openTeamTable.id, coachedTeamIdsQuery({ userId: session.userId, eventId }));
  return db
    .select()
    .from(openTeamTable)
    .where(where)
    .orderBy(asc(openTeamTable.sortOrder), asc(openTeamTable.name));
}

/**
 * Loads (one D1 round trip) and validates everything a points/scores mutation references:
 * the event, rule/week/workout/scaling (each must belong to the event), and the session's
 * manageable team ids. Throws ZSAError on invalid refs. Check entries with `assertEntryInContext`.
 * Scores take no weekId: the week (for lock checks) is always the workout's week.
 */
export async function loadManageContext({
  session,
  eventId,
  kind,
  ruleId,
  weekId,
  workoutId,
  scalingId,
}: {
  session: OpenActorSession;
  eventId: string;
  kind: ManageKind;
  ruleId?: string;
  weekId?: string;
  workoutId?: string;
  scalingId?: string;
}) {
  const db = getDB();
  const isAdmin = isOpenAdmin(session);
  const isScores = kind === MANAGE_KIND.SCORES;

  const weekCondition = isScores
    ? workoutId
      ? inArray(
          openWeekTable.id,
          db.select({ id: openWorkoutTable.weekId }).from(openWorkoutTable).where(eq(openWorkoutTable.id, workoutId)),
        )
      : sql`0`
    : byIdIfRequested({ column: openWeekTable.id, id: weekId });

  const [events, rules, weeks, workouts, scalings, coachedTeams] = await db.batch([
    db.select().from(openEventTable).where(eq(openEventTable.id, eventId)),
    db.select().from(openPointRuleTable).where(byIdIfRequested({ column: openPointRuleTable.id, id: ruleId })),
    db.select().from(openWeekTable).where(weekCondition),
    db.select().from(openWorkoutTable).where(byIdIfRequested({ column: openWorkoutTable.id, id: workoutId })),
    db.select().from(openScalingTable).where(byIdIfRequested({ column: openScalingTable.id, id: scalingId })),
    // Unused for admins, but cheap and keeps the batch shape fixed
    coachedTeamIdsQuery({ userId: session.userId, eventId }),
  ]);

  const event = events[0];
  if (!event) throw new ZSAError("NOT_FOUND", "Event not found");

  // undefined = not requested; null = requested but missing. Scores: the workout's week, if any.
  const context = {
    kind,
    isAdmin,
    manageableTeamIds: new Set(coachedTeams.map((row) => row.teamId)) as ReadonlySet<string>,
    event,
    rule: ruleId ? (rules[0] ?? null) : undefined,
    week: isScores ? weeks[0] : weekId ? (weeks[0] ?? null) : undefined,
    workout: workoutId ? (workouts[0] ?? null) : undefined,
    scaling: scalingId ? (scalings[0] ?? null) : undefined,
  };

  throwIfDenied(decideManageContext(context));
  return context;
}

export type LoadedManageContext = Awaited<ReturnType<typeof loadManageContext>>;

/** Per-entry check for bulk writers (load entries by eventId, then check each against the context). */
export function assertEntryInContext({
  context,
  entry,
}: {
  context: LoadedManageContext;
  entry: { eventId: string; teamId: string | null };
}) {
  throwIfDenied(decideManageEntry({ context, entry }));
}

/**
 * Convenience for single-entry actions: loads the entry (must be in `eventId`), then its manage context
 * (two round trips), and checks the entry. Returns the loaded rows so actions don't re-query.
 */
export async function assertCanManageEntry({
  session,
  eventId,
  entryId,
  ...refs
}: {
  session: OpenActorSession;
  eventId: string;
  entryId: string;
  kind: ManageKind;
  ruleId?: string;
  weekId?: string;
  workoutId?: string;
  scalingId?: string;
}) {
  const db = getDB();
  const entry = await db.query.openEntryTable.findFirst({
    where: eq(openEntryTable.id, entryId),
    with: { participant: { columns: { id: true, name: true } } },
  });
  // The caller's eventId pins the request: an entry from another event is simply "not found"
  if (!entry || entry.eventId !== eventId) throw new ZSAError("NOT_FOUND", "Athlete not found in this event");

  const context = await loadManageContext({ session, eventId, ...refs });
  assertEntryInContext({ context, entry });
  return { ...context, entry };
}

/**
 * Team profile edits: loads the team and, for non-admins, the coached team ids in one
 * round trip. The team must be in `eventId` (otherwise "not found"). Not gated by coach event
 * flags or week locks. Returns the loaded team row so actions don't re-query.
 */
export async function assertCanManageTeam({
  session,
  eventId,
  teamId,
}: {
  session: OpenActorSession;
  eventId: string;
  teamId: string;
}) {
  const db = getDB();
  const [teams, coachedTeams] = await db.batch([
    db.select().from(openTeamTable).where(eq(openTeamTable.id, teamId)),
    coachedTeamIdsQuery({ userId: session.userId, eventId }),
  ]);
  const team = teams[0] ?? null;

  throwIfDenied(
    decideManageTeam({
      isAdmin: isOpenAdmin(session),
      manageableTeamIds: new Set(coachedTeams.map((row) => row.teamId)),
      eventId,
      team,
    }),
  );
  return team!; // decideManageTeam denies a null team
}
