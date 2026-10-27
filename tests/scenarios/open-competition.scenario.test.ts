import { beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { getDB } from "@/db";
import {
  coachTable,
  openAwardTable,
  openAuditLogTable,
  openEntryTable,
  openEventTable,
  openParticipantTable,
  openPointRuleTable,
  openScalingTable,
  openScoreTable,
  openTeamTable,
  openWeekTable,
  openWorkoutTable,
  userTable,
} from "@/db/schema";
import { createOpenEventAction, updateOpenEventAction, deleteOpenEventAction } from "@/actions/open/events.action";
import { createOpenTeamAction, assignOpenTeamCoachAction, deleteOpenTeamAction } from "@/actions/open/teams.action";
import { importRosterAction, bulkAssignTeamsAction, removeOpenEntryAction } from "@/actions/open/roster.action";
import { linkCoachUserAction } from "@/actions/open/coach-link.action";
import { createOpenRuleAction, updateOpenRuleAction, deleteOpenRuleAction } from "@/actions/open/rules.action";
import { createOpenWorkoutAction, updateOpenWorkoutAction } from "@/actions/open/workouts.action";
import { lockOpenWeekAction, unlockOpenWeekAction, deleteOpenWeekAction } from "@/actions/open/weeks.action";
import { setAwardAction, setAwardsForEntriesAction, addUnlimitedAwardAction, removeAwardAction } from "@/actions/open/awards.action";
import { setScoreAction, clearScoreAction } from "@/actions/open/scores.action";
import { getStandings } from "@/server/open/standings";
import { computeStandings, NO_WEEK_KEY } from "@/lib/open/standings";
import { withStandingRanks, decideEventVisibility, EVENT_VISIBILITY } from "@/lib/open/public-view";
import { compareScores } from "@/lib/open/score-codec";
import { loadEventBoard } from "@/app/(open)/open/_lib/load-event-board";
import { setScenarioActor, initializeScenarioD1, clearScenarioRevalidations, scenarioRevalidations } from "./scenario-setup";

type SafeAction<T> = (input: T) => Promise<[unknown, { message?: string } | null]>;

async function call<T>({ action, input }: { action: SafeAction<T>; input: T }) {
  const [data, error] = await action(input);
  if (error) throw new Error(error.message ?? "Action failed");
  return data as Record<string, any>;
}

async function rejects<T>({ action, input, message }: { action: SafeAction<T>; input: T; message?: RegExp }) {
  const [data, error] = await action(input);
  expect(data).toBeNull();
  expect(error).toBeTruthy();
  if (message) expect(error?.message).toMatch(message);
  return error!;
}

const ids: {
  eventId: string;
  weeks: string[];
  teams: string[];
  entries: string[];
  coaches: string[];
  rules: Record<string, string>;
  scalings: Record<string, string>;
  workouts: Record<string, string>;
} = { eventId: "", weeks: [], teams: [], entries: [], coaches: [], rules: {}, scalings: {}, workouts: {} };

describe("Open 2026 competition scenarios (real actions + isolated local D1)", () => {
  beforeAll(async () => {
    await initializeScenarioD1();
    setScenarioActor("admin");
    const db = getDB();
    const now = new Date();
    await db.insert(openParticipantTable).values({
      id: "scenario-alumni-participant", name: "Alumni Athlete", email: null, createdAt: now, updatedAt: now,
    });
    await db.insert(userTable).values([
      { id: "scenario-admin", firstName: "Admin", lastName: "Open", email: "admin@scenario.test", role: "admin", createdAt: now, updatedAt: now },
      { id: "scenario-coachA", firstName: "Coach", lastName: "A", email: "coach-a@scenario.test", role: "user", createdAt: now, updatedAt: now },
      { id: "scenario-coachB", firstName: "Coach", lastName: "B", email: "coach-b@scenario.test", role: "user", createdAt: now, updatedAt: now },
    ]);
    await db.insert(coachTable).values([
      { id: "scenario-coach-profile-a", name: "Coach A", slug: "scenario-coach-a", createdAt: now, updatedAt: now },
      { id: "scenario-coach-profile-b", name: "Coach B", slug: "scenario-coach-b", createdAt: now, updatedAt: now },
    ]);

    const event = await call({ action: createOpenEventAction as SafeAction<any>, input: { name: "Open 2026", slug: "open-2026-scenario", year: 2026, weekCount: 3, weightUnit: "lb" } });
    ids.eventId = event.id;
    const [weeks, scalings, rules] = await Promise.all([
      db.select().from(openWeekTable).where(eq(openWeekTable.eventId, event.id)).orderBy(openWeekTable.number),
      db.select().from(openScalingTable).where(eq(openScalingTable.eventId, event.id)).orderBy(openScalingTable.rank),
      db.select().from(openPointRuleTable).where(eq(openPointRuleTable.eventId, event.id)),
    ]);
    ids.weeks = weeks.map((week) => week.id);
    ids.scalings = Object.fromEntries(scalings.map((row) => [row.slug, row.id]));
    ids.rules.default = rules[0]!.id;
    await call({ action: updateOpenRuleAction as SafeAction<any>, input: { ruleId: ids.rules.default, points: 2 } });
    ids.rules.costume = (await call({ action: createOpenRuleAction as SafeAction<any>, input: { eventId: event.id, name: "Costume", points: 2, cadence: "per_week", coachAwardable: true } })).id;
    ids.rules.friend = (await call({ action: createOpenRuleAction as SafeAction<any>, input: { eventId: event.id, name: "Bring a friend", points: 1, cadence: "unlimited", coachAwardable: true } })).id;
    ids.rules.judges = (await call({ action: createOpenRuleAction as SafeAction<any>, input: { eventId: event.id, name: "Judges Course", points: 3, cadence: "once_per_event", coachAwardable: true } })).id;
    ids.rules.spirit = (await call({ action: createOpenRuleAction as SafeAction<any>, input: { eventId: event.id, name: "Spirit of the Open", points: 5, cadence: "per_week", coachAwardable: false } })).id;
    ids.rules.coachCheckin = (await call({ action: createOpenRuleAction as SafeAction<any>, input: { eventId: event.id, name: "Coach check-in", points: 0, cadence: "per_week", coachAwardable: true } })).id;
    ids.rules.coachRepeat = (await call({ action: createOpenRuleAction as SafeAction<any>, input: { eventId: event.id, name: "Coach repeat", points: 0, cadence: "unlimited", coachAwardable: true } })).id;

    ids.teams = (await Promise.all(["Red", "Blue", "Green", "Gold"].map(async (name, index) =>
      (await call({ action: createOpenTeamAction as SafeAction<any>, input: { eventId: event.id, name, sortOrder: index } })).id,
    )));
    ids.coaches = ["scenario-coach-profile-a", "scenario-coach-profile-b"];
    await call({ action: linkCoachUserAction as SafeAction<any>, input: { coachId: ids.coaches[0], userId: "scenario-coachA" } });
    await call({ action: linkCoachUserAction as SafeAction<any>, input: { coachId: ids.coaches[1], userId: "scenario-coachB" } });
    await call({ action: assignOpenTeamCoachAction as SafeAction<any>, input: { teamId: ids.teams[0], coachId: ids.coaches[0] } });
    await call({ action: assignOpenTeamCoachAction as SafeAction<any>, input: { teamId: ids.teams[1], coachId: ids.coaches[0] } });
    await call({ action: assignOpenTeamCoachAction as SafeAction<any>, input: { teamId: ids.teams[2], coachId: ids.coaches[1] } });

    const lines = Array.from({ length: 24 }, (_, index) => `Athlete ${String(index + 1).padStart(2, "0")},athlete${index + 1}@scenario.test`);
    lines.push("Alumni Athlete,alumni@scenario.test");
    lines.push("Athlete 01,athlete1@scenario.test", "Athlete 02,athlete2@scenario.test");
    const imported = await call({ action: importRosterAction as SafeAction<any>, input: { eventId: event.id, text: lines.join("\n") } });
    expect(imported.created).toBe(25);
    expect(imported.reused).toHaveLength(1);
    expect(imported.skipped).toHaveLength(2);
    const entries = await db.select({ id: openEntryTable.id, participantName: openParticipantTable.name })
      .from(openEntryTable).innerJoin(openParticipantTable, eq(openEntryTable.participantId, openParticipantTable.id))
      .where(eq(openEntryTable.eventId, event.id)).orderBy(openParticipantTable.name);
    ids.entries = entries.filter((entry) => entry.participantName.startsWith("Athlete ")).map((entry) => entry.id);
    await call({ action: bulkAssignTeamsAction as SafeAction<any>, input: {
      eventId: event.id,
      assignments: entries.filter((entry) => entry.participantName.startsWith("Athlete ")).map((entry, index) => ({ entryId: entry.id, teamId: ids.teams[index % ids.teams.length] })),
    } });

    ids.workouts.time = (await call({ action: createOpenWorkoutAction as SafeAction<any>, input: {
      eventId: event.id, weekId: ids.weeks[0], name: "26.1", scoreType: "time", timeCapSeconds: 900, hasTiebreak: true,
    } })).id;
    ids.workouts.reps = (await call({ action: createOpenWorkoutAction as SafeAction<any>, input: {
      eventId: event.id, weekId: ids.weeks[1], name: "26.2", scoreType: "rounds_reps", repsPerRound: 30,
    } })).id;
    ids.workouts.load = (await call({ action: createOpenWorkoutAction as SafeAction<any>, input: {
      eventId: event.id, weekId: ids.weeks[2], name: "26.3", scoreType: "load",
    } })).id;
  }, 60_000);

  it("Scenario 1: creates defaults, runs weekly awards and scores, and derives standings", async () => {
    const db = getDB();
    const [scalings, weeks] = await Promise.all([
      db.select().from(openScalingTable).where(eq(openScalingTable.eventId, ids.eventId)).orderBy(openScalingTable.rank),
      db.select().from(openWeekTable).where(eq(openWeekTable.eventId, ids.eventId)),
    ]);
    expect(scalings.map(({ name, rank }) => [name, rank])).toEqual([["Rx", 0], ["Scaled", 1], ["Foundations", 2]]);
    expect(weeks).toHaveLength(3);
    const defaultRules = await db.select().from(openPointRuleTable).where(eq(openPointRuleTable.eventId, ids.eventId));
    expect(defaultRules.some((rule) => rule.name === "Workout Completion" && rule.points === 2 && rule.cadence === "per_week")).toBe(true);
    expect(defaultRules.some((rule) => rule.name === "Judges Course" && rule.cadence === "once_per_event")).toBe(true);

    await call({ action: updateOpenEventAction as SafeAction<any>, input: { eventId: ids.eventId, status: "live", coachPointsEnabled: true, coachScoresEnabled: true } });
    const weeklyTarget = ids.entries.slice(0, 4);
    for (let weekIndex = 0; weekIndex < 3; weekIndex += 1) {
      await call({ action: setAwardsForEntriesAction as SafeAction<any>, input: {
        eventId: ids.eventId, ruleId: ids.rules.costume, weekId: ids.weeks[weekIndex], entryIds: weeklyTarget, awarded: true,
      } });
      await call({ action: setAwardAction as SafeAction<any>, input: {
        eventId: ids.eventId, entryId: ids.entries[weekIndex], ruleId: ids.rules.default, weekId: ids.weeks[weekIndex], awarded: true,
      } });
      await call({ action: addUnlimitedAwardAction as SafeAction<any>, input: { eventId: ids.eventId, entryId: ids.entries[weekIndex], ruleId: ids.rules.friend } });
      if (weekIndex === 0) await call({ action: setAwardAction as SafeAction<any>, input: {
        eventId: ids.eventId, entryId: ids.entries[0], ruleId: ids.rules.judges, awarded: true,
      } });
      const workoutId = [ids.workouts.time, ids.workouts.reps, ids.workouts.load][weekIndex]!;
      const scalingId = ids.scalings.rx!;
      for (let index = 0; index < 8; index += 1) {
        const entryId = ids.entries[index]!;
        const input = weekIndex === 0 ? `${5 + index}:00` : weekIndex === 1 ? `${5 + index}+${index}` : `${100 + index} lb`;
        await call({ action: setScoreAction as SafeAction<any>, input: {
          eventId: ids.eventId, entryId, workoutId, scalingId, input,
          ...(weekIndex === 0 ? { tiebreak: `1:${String(index).padStart(2, "0")}` } : {}),
        } });
      }
      if (weekIndex === 0) {
        await call({ action: setScoreAction as SafeAction<any>, input: {
          eventId: ids.eventId, entryId: ids.entries[1], workoutId, scalingId: ids.scalings.rx, input: "5:00", tiebreak: "0:59",
        } });
        await call({ action: setScoreAction as SafeAction<any>, input: {
          eventId: ids.eventId, entryId: ids.entries[8], workoutId, scalingId: ids.scalings.scaled, input: "4:00",
        } });
        await call({ action: setScoreAction as SafeAction<any>, input: {
          eventId: ids.eventId, entryId: ids.entries[9], workoutId, scalingId: ids.scalings.rx, input: "CAP+200",
        } });
        setScenarioActor("coachA");
        await call({ action: setAwardAction as SafeAction<any>, input: {
          eventId: ids.eventId, entryId: ids.entries[4], ruleId: ids.rules.coachCheckin, weekId: ids.weeks[0], awarded: true,
        } });
        await call({ action: setAwardsForEntriesAction as SafeAction<any>, input: {
          eventId: ids.eventId, ruleId: ids.rules.coachCheckin, weekId: ids.weeks[0], entryIds: [ids.entries[4], ids.entries[5]], awarded: true,
        } });
        const repeatAward = await call({ action: addUnlimitedAwardAction as SafeAction<any>, input: {
          eventId: ids.eventId, entryId: ids.entries[4], ruleId: ids.rules.coachRepeat,
        } });
        await call({ action: removeAwardAction as SafeAction<any>, input: { eventId: ids.eventId, awardId: repeatAward.awardId } });
        setScenarioActor("coachB");
        await call({ action: setScoreAction as SafeAction<any>, input: {
          eventId: ids.eventId, entryId: ids.entries[10], workoutId, scalingId: ids.scalings.rx, input: "7:00",
        } });
        setScenarioActor("admin");
      }
      await call({ action: lockOpenWeekAction as SafeAction<any>, input: { weekId: ids.weeks[weekIndex] } });
      const standings = await getStandings({ eventId: ids.eventId });
      expect(standings.teams.reduce((sum, team) => sum + team.total, 0)).toBe([14, 25, 36][weekIndex]);
      expect(standings.individuals.length).toBe(25);
    }

    const awards = await db.select().from(openAwardTable).innerJoin(openEntryTable, eq(openAwardTable.entryId, openEntryTable.id))
      .where(eq(openEntryTable.eventId, ids.eventId));
    const snapshot = awards.map(({ open_award: award }) => ({ entryId: award.entryId, ruleId: award.ruleId, weekId: award.weekId, points: award.points }));
    const entries = await db.select({ id: openEntryTable.id, teamId: openEntryTable.teamId, participantName: openParticipantTable.name })
      .from(openEntryTable).innerJoin(openParticipantTable, eq(openEntryTable.participantId, openParticipantTable.id)).where(eq(openEntryTable.eventId, ids.eventId));
    const teams = await db.select({ id: openTeamTable.id, name: openTeamTable.name, slug: openTeamTable.slug, color: openTeamTable.color, sortOrder: openTeamTable.sortOrder })
      .from(openTeamTable).where(eq(openTeamTable.eventId, ids.eventId));
    const independent = computeStandings({ teams, entries, awards: snapshot });
    const actual = await getStandings({ eventId: ids.eventId });
    expect(actual).toEqual(independent);
    expect(actual.teams.map(({ total, memberCount, avgPerMember }) => [total, memberCount, avgPerMember])).toEqual([[12, 6, 2], [9, 6, 1.5], [9, 6, 1.5], [6, 6, 1]]);
    const [red, blue, green, gold] = actual.teams;
    expect([red!.byWeek, red!.byRule]).toEqual([
      { [ids.weeks[0]!]: 4, [ids.weeks[1]!]: 2, [ids.weeks[2]!]: 2, [NO_WEEK_KEY]: 4 },
      { [ids.rules.costume!]: 6, [ids.rules.default!]: 2, [ids.rules.friend!]: 1, [ids.rules.judges!]: 3, [ids.rules.coachCheckin!]: 0 },
    ]);
    expect([blue!.total, green!.total, gold!.total]).toEqual([9, 9, 6]);
    expect(actual.individuals.slice(0, 4).map(({ entryId, total }) => [entryId, total])).toEqual([
      [ids.entries[0], 12], [ids.entries[1], 9], [ids.entries[2], 9], [ids.entries[3], 6],
    ]);
    expect(withStandingRanks({ teams: actual.teams }).every(({ rank, avgRank }) => rank > 0 && avgRank > 0)).toBe(true);
    const firstWorkoutScores = await db.select().from(openScoreTable).where(eq(openScoreTable.workoutId, ids.workouts.time));
    const byEntry = new Map(firstWorkoutScores.map((score) => [score.entryId, score]));
    const rankCompare = (a: string, b: string) => compareScores({
      a: { ...byEntry.get(a)!, scalingRank: byEntry.get(a)!.scalingId === ids.scalings.rx ? 0 : 1 },
      b: { ...byEntry.get(b)!, scalingRank: byEntry.get(b)!.scalingId === ids.scalings.rx ? 0 : 1 },
      workout: { scoreType: "time", timeCapSeconds: 900, repsPerRound: null },
    });
    expect(rankCompare(ids.entries[0]!, ids.entries[8]!)).toBeLessThan(0); // Rx outranks a faster Scaled result.
    expect(rankCompare(ids.entries[0]!, ids.entries[9]!)).toBeLessThan(0); // Finished outranks capped.
    expect(rankCompare(ids.entries[1]!, ids.entries[0]!)).toBeLessThan(0); // Faster tiebreak resolves a tied score.
    expect(byEntry.get(ids.entries[9]!)?.capped).toBe(true);
    expect(byEntry.get(ids.entries[9]!)?.value).toBe(200);
    const roundsScore = await db.query.openScoreTable.findFirst({ where: and(eq(openScoreTable.entryId, ids.entries[0]!), eq(openScoreTable.workoutId, ids.workouts.reps)) });
    expect(roundsScore?.value).toBe(150);
    const loadScore = await db.query.openScoreTable.findFirst({ where: and(eq(openScoreTable.entryId, ids.entries[0]!), eq(openScoreTable.workoutId, ids.workouts.load)) });
    expect(loadScore?.value).toBe(45_359);
    expect((await db.select().from(openAwardTable).where(and(eq(openAwardTable.entryId, ids.entries[0]!), eq(openAwardTable.ruleId, ids.rules.judges!))))[0]?.dedupeKey).toBe("event");
    const event = await db.query.openEventTable.findFirst({ where: eq(openEventTable.id, ids.eventId) });
    const hiddenBoard = await loadEventBoard({ ...event!, showIndividuals: false });
    expect(hiddenBoard.topIndividuals).toEqual([]);
    expect(hiddenBoard.pointsByEntry.size).toBe(0);
    expect(decideEventVisibility({ status: "live", isAdmin: false })).toBe(EVENT_VISIBILITY.PUBLIC);
  });

  it("Scenario 2: enforces team, event, lock, flags, cadence, score-shape, and dependent-delete rules", async () => {
    const db = getDB();
    const entry = ids.entries[0]!;
    setScenarioActor("coachB");
    await rejects({ action: setAwardAction as SafeAction<any>, input: { eventId: ids.eventId, entryId: entry, ruleId: ids.rules.costume, weekId: ids.weeks[0], awarded: true }, message: /team|manage/i });
    setScenarioActor("admin");
    setScenarioActor("coachA");
    await rejects({ action: setAwardAction as SafeAction<any>, input: { eventId: ids.eventId, entryId: ids.entries[4], ruleId: ids.rules.costume, weekId: ids.weeks[0], awarded: true }, message: /locked/i });
    setScenarioActor("admin");
    await rejects({ action: setAwardAction as SafeAction<any>, input: { eventId: "wrong-event", entryId: entry, ruleId: ids.rules.costume, weekId: ids.weeks[0], awarded: true } });
    await rejects({ action: updateOpenRuleAction as SafeAction<any>, input: { ruleId: ids.rules.costume, cadence: "unlimited" }, message: /award/i });
    await rejects({ action: updateOpenWorkoutAction as SafeAction<any>, input: { workoutId: ids.workouts.time, scoreType: "reps" }, message: /scores/i });
    await rejects({ action: deleteOpenWeekAction as SafeAction<any>, input: { weekId: ids.weeks[0] }, message: /workout/i });
    await rejects({ action: deleteOpenRuleAction as SafeAction<any>, input: { ruleId: ids.rules.costume }, message: /award/i });
    await rejects({ action: deleteOpenTeamAction as SafeAction<any>, input: { teamId: ids.teams[0] }, message: /athlete|entry/i });
    await rejects({ action: deleteOpenEventAction as SafeAction<any>, input: { eventId: ids.eventId }, message: /draft|entry/i });

    await call({ action: unlockOpenWeekAction as SafeAction<any>, input: { weekId: ids.weeks[0] } });
    await call({ action: updateOpenEventAction as SafeAction<any>, input: { eventId: ids.eventId, coachPointsEnabled: false, coachScoresEnabled: false } });
    setScenarioActor("coachA");
    await rejects({ action: setScoreAction as SafeAction<any>, input: {
      eventId: ids.eventId, entryId: ids.entries[4], workoutId: ids.workouts.time, scalingId: ids.scalings.rx, input: "4:00",
    }, message: /disabled/i });
    setScenarioActor("admin");
    await call({ action: updateOpenEventAction as SafeAction<any>, input: { eventId: ids.eventId, coachPointsEnabled: true } });
    setScenarioActor("coachA");
    await rejects({ action: setAwardAction as SafeAction<any>, input: {
      eventId: ids.eventId, entryId: ids.entries[4], ruleId: ids.rules.spirit, weekId: ids.weeks[0], awarded: true,
    }, message: /award|allowed/i });
    setScenarioActor("admin");
    await call({ action: updateOpenEventAction as SafeAction<any>, input: { eventId: ids.eventId, coachPointsEnabled: true, coachScoresEnabled: true } });
    await call({ action: lockOpenWeekAction as SafeAction<any>, input: { weekId: ids.weeks[0] } });

    const awardsBefore = await db.select().from(openAwardTable).where(and(eq(openAwardTable.entryId, entry), eq(openAwardTable.ruleId, ids.rules.costume)));
    expect(awardsBefore).toHaveLength(3);
    const scoreBefore = await db.select().from(openScoreTable).where(and(eq(openScoreTable.entryId, entry), eq(openScoreTable.workoutId, ids.workouts.time)));
    expect(scoreBefore).toHaveLength(1);
  });

  it("Scenario 3: writes one audit for changed entities and none for no-op updates", async () => {
    const db = getDB();
    const before = await db.select().from(openAuditLogTable).where(eq(openAuditLogTable.eventId, ids.eventId));
    const teamId = ids.teams[3]!;
    clearScenarioRevalidations();
    const currentTeam = await db.query.openTeamTable.findFirst({ where: eq(openTeamTable.id, teamId) });
    await call({ action: updateOpenEventAction as SafeAction<any>, input: { eventId: ids.eventId, name: "Open 2026" } });
    await call({ action: setAwardAction as SafeAction<any>, input: { eventId: ids.eventId, entryId: ids.entries[0], ruleId: ids.rules.costume, weekId: ids.weeks[0], awarded: true } });
    await call({ action: updateOpenEventAction as SafeAction<any>, input: { eventId: ids.eventId, name: "Open 2026" } });
    const after = await db.select().from(openAuditLogTable).where(eq(openAuditLogTable.eventId, ids.eventId));
    expect(after).toHaveLength(before.length);
    expect(currentTeam?.name).toBe("Gold");
    expect(scenarioRevalidations().length).toBeGreaterThan(0);

    const idempotentEntry = ids.entries[20]!;
    const awardCreatesBefore = (await db.select().from(openAuditLogTable)).filter((audit) => audit.entityType === "award" && audit.action === "create").length;
    await call({ action: setAwardAction as SafeAction<any>, input: { eventId: ids.eventId, entryId: idempotentEntry, ruleId: ids.rules.judges, awarded: true } });
    await call({ action: setAwardAction as SafeAction<any>, input: { eventId: ids.eventId, entryId: idempotentEntry, ruleId: ids.rules.judges, awarded: true } });
    await call({ action: setAwardAction as SafeAction<any>, input: { eventId: ids.eventId, entryId: idempotentEntry, ruleId: ids.rules.judges, awarded: false } });
    await call({ action: setAwardAction as SafeAction<any>, input: { eventId: ids.eventId, entryId: idempotentEntry, ruleId: ids.rules.judges, awarded: false } });
    const awardCreatesAfter = (await db.select().from(openAuditLogTable)).filter((audit) => audit.entityType === "award" && audit.action === "create").length;
    expect(awardCreatesAfter - awardCreatesBefore).toBe(1);

    const score = await db.query.openScoreTable.findFirst({ where: and(eq(openScoreTable.entryId, ids.entries[0]!), eq(openScoreTable.workoutId, ids.workouts.load)) });
    await call({ action: clearScoreAction as SafeAction<any>, input: { eventId: ids.eventId, entryId: ids.entries[0], workoutId: ids.workouts.load } });
    await call({ action: clearScoreAction as SafeAction<any>, input: { eventId: ids.eventId, entryId: ids.entries[0], workoutId: ids.workouts.load } });
    const clearAudits = await db.select().from(openAuditLogTable)
      .where(and(eq(openAuditLogTable.entityId, score!.id), eq(openAuditLogTable.action, "delete")));
    expect(clearAudits).toHaveLength(1);

    const retiredRule = await call({ action: createOpenRuleAction as SafeAction<any>, input: {
      eventId: ids.eventId, name: "Retired carry-over", points: 4, cadence: "per_week", coachAwardable: false,
    } });
    const beforeRetiredAward = await getStandings({ eventId: ids.eventId });
    await call({ action: setAwardAction as SafeAction<any>, input: {
      eventId: ids.eventId, entryId: ids.entries[0], ruleId: retiredRule.id, weekId: ids.weeks[0], awarded: true,
    } });
    await call({ action: updateOpenRuleAction as SafeAction<any>, input: { ruleId: retiredRule.id, isActive: false } });
    const retiredStandings = await getStandings({ eventId: ids.eventId });
    expect(retiredStandings.individuals.find((individual) => individual.entryId === ids.entries[0])!.total)
      .toBe(beforeRetiredAward.individuals.find((individual) => individual.entryId === ids.entries[0])!.total + 4);
  });

  it("Scenario 3 regression: concurrent deletes write exactly one delete audit", async () => {
    const db = getDB();
    const rule = await call({ action: createOpenRuleAction as SafeAction<any>, input: {
      eventId: ids.eventId, name: "Concurrent delete target", points: 1, cadence: "per_week",
    } });
    await Promise.all([
      deleteOpenRuleAction({ ruleId: rule.id }),
      deleteOpenRuleAction({ ruleId: rule.id }),
    ]);
    const deleteAudits = await db.select().from(openAuditLogTable)
      .where(and(eq(openAuditLogTable.entityId, rule.id), eq(openAuditLogTable.action, "delete")));
    expect(deleteAudits).toHaveLength(1);
  });

  it("Scenario 4: locks coaches out, keeps admin writes available, and confirms current-team standings", async () => {
    setScenarioActor("coachA");
    await rejects({ action: setScoreAction as SafeAction<any>, input: {
      eventId: ids.eventId, entryId: ids.entries[0], workoutId: ids.workouts.time, scalingId: ids.scalings.rx, input: "4:00",
    }, message: /locked/i });
    setScenarioActor("admin");
    await call({ action: setScoreAction as SafeAction<any>, input: {
      eventId: ids.eventId, entryId: ids.entries[0], workoutId: ids.workouts.time, scalingId: ids.scalings.rx, input: "4:00",
    } });
    const prior = await getStandings({ eventId: ids.eventId });
    const movedAwards = await getDB().select().from(openAwardTable).where(eq(openAwardTable.entryId, ids.entries[0]!));
    await call({ action: bulkAssignTeamsAction as SafeAction<any>, input: {
      eventId: ids.eventId, assignments: [{ entryId: ids.entries[0], teamId: ids.teams[1] }],
    } });
    const current = await getStandings({ eventId: ids.eventId });
    const movedPoints = movedAwards.reduce((total, award) => total + award.points, 0);
    expect(current.teams.find((team) => team.id === ids.teams[0])!.total).toBe(prior.teams.find((team) => team.id === ids.teams[0])!.total - movedPoints);
    expect(current.teams.find((team) => team.id === ids.teams[1])!.total).toBe(prior.teams.find((team) => team.id === ids.teams[1])!.total + movedPoints);
    expect(decideEventVisibility({ status: "draft", isAdmin: false })).toBe(EVENT_VISIBILITY.HIDDEN);

    const entry = await getDB().query.openEntryTable.findFirst({ where: eq(openEntryTable.id, ids.entries[0]!) });
    await rejects({ action: removeOpenEntryAction as SafeAction<any>, input: { entryId: ids.entries[0], force: false }, message: /remove anyway/i });
    const removed = await call({ action: removeOpenEntryAction as SafeAction<any>, input: { entryId: ids.entries[0], force: true } });
    expect(removed.deletedAwards).toBeGreaterThan(0);
    expect(removed.deletedScores).toBeGreaterThan(0);
    expect(await getDB().query.openEntryTable.findFirst({ where: eq(openEntryTable.id, ids.entries[0]!) })).toBeUndefined();
    expect(await getDB().query.openParticipantTable.findFirst({ where: eq(openParticipantTable.id, entry!.participantId) })).toBeTruthy();
  });
});
