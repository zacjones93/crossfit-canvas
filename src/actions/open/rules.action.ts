"use server";

import { createServerAction, ZSAError } from "zsa";
import { count, eq, notExists } from "drizzle-orm";
import { getDB } from "@/db";
import { newOpenId, openAwardTable, openPointRuleTable } from "@/db/schema";
import { formatPoints } from "@/lib/open/audit";
import { OPEN_AUDIT_ENTITY, OPEN_AUDIT_VERB } from "@/lib/open/constants";
import { createOpenRuleSchema, openRuleIdSchema, updateOpenRuleSchema } from "@/schemas/open.schema";
import { auditStatement } from "@/server/open/audit-write";
import {
  auditedDelete,
  auditedUpdate,
  loadEvent,
  requireOpenAdmin,
  revalidateOpenEvent,
  runOpenBatch,
  type OpenDB,
} from "@/server/open/write";

function hasAwardsMessage(ruleName: string) {
  return `"${ruleName}" has awards; deactivate it instead of deleting`;
}

async function loadRuleWithAwardCount({ db, ruleId }: { db: OpenDB; ruleId: string }) {
  const [rules, [{ awardCount }]] = await db.batch([
    db.select().from(openPointRuleTable).where(eq(openPointRuleTable.id, ruleId)),
    db.select({ awardCount: count() }).from(openAwardTable).where(eq(openAwardTable.ruleId, ruleId)),
  ]);
  if (!rules[0]) throw new ZSAError("NOT_FOUND", "Rule not found");
  return { rule: rules[0], awardCount };
}

export const createOpenRuleAction = createServerAction()
  .input(createOpenRuleSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { eventId } = input;

    await loadEvent({ db, eventId });

    const rule = {
      id: newOpenId.rule(),
      eventId,
      name: input.name,
      description: input.description ?? null,
      points: input.points,
      cadence: input.cadence,
      coachAwardable: input.coachAwardable,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive,
    };

    await runOpenBatch({
      db,
      statements: [
        db.insert(openPointRuleTable).values(rule),
        auditStatement({
          db,
          eventId,
          actorUserId: session.userId,
          verb: OPEN_AUDIT_VERB.CREATE,
          entityType: OPEN_AUDIT_ENTITY.RULE,
          entityId: rule.id,
          after: rule,
          summary: `Created rule "${rule.name}" — ${formatPoints(rule.points)}, ${rule.cadence}`,
        }),
      ],
    });

    revalidateOpenEvent({ eventId });
    return rule;
  });

/** Cadence is frozen once the rule has awards (it determines their dedupe keys). Points changes don't touch past awards. */
export const updateOpenRuleAction = createServerAction()
  .input(updateOpenRuleSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { ruleId, ...updates } = input;

    const { rule, awardCount } = await loadRuleWithAwardCount({ db, ruleId });
    const cadenceFrozen = `"${rule.name}" already has awards, so its cadence can't change; create a new rule instead`;
    if (updates.cadence && updates.cadence !== rule.cadence && awardCount > 0) {
      throw new ZSAError("PRECONDITION_FAILED", cadenceFrozen);
    }

    const { row, changed } = await auditedUpdate({
      db,
      table: openPointRuleTable,
      entityType: OPEN_AUDIT_ENTITY.RULE,
      eventId: rule.eventId,
      actorUserId: session.userId,
      row: rule,
      updates,
      describe: ({ after, changedKeys }) => `Updated rule "${after.name}" (${changedKeys.join(", ")})`,
      // Re-checked inside the batch: no award may land between the count and the cadence change
      guard: ({ changes }) =>
        changes.cadence
          ? {
              condition: notExists(db.select({ id: openAwardTable.id }).from(openAwardTable).where(eq(openAwardTable.ruleId, ruleId))),
              message: cadenceFrozen,
              code: "PRECONDITION_FAILED",
            }
          : undefined,
    });

    if (changed) revalidateOpenEvent({ eventId: rule.eventId });
    return row;
  });

/** Only rules without awards; retire used rules with `isActive: false`. */
export const deleteOpenRuleAction = createServerAction()
  .input(openRuleIdSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { rule, awardCount } = await loadRuleWithAwardCount({ db, ruleId: input.ruleId });
    if (awardCount > 0) throw new ZSAError("PRECONDITION_FAILED", hasAwardsMessage(rule.name));

    await auditedDelete({
      db,
      table: openPointRuleTable,
      entityType: OPEN_AUDIT_ENTITY.RULE,
      eventId: rule.eventId,
      actorUserId: session.userId,
      row: rule,
      summary: `Deleted rule "${rule.name}"`,
      // An award landed between the check and the delete
      messages: { foreignKey: hasAwardsMessage(rule.name) },
    });

    revalidateOpenEvent({ eventId: rule.eventId });
    return { success: true };
  });
