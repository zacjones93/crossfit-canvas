"use server";

import { revalidatePath } from "next/cache";
import { createServerAction, ZSAError } from "zsa";
import { asc, eq, like, or, sql } from "drizzle-orm";
import { getDB } from "@/db";
import { coachTable, userTable } from "@/db/schema";
import { OPEN_AUDIT_ENTITY, OPEN_AUDIT_VERB } from "@/lib/open/constants";
import { linkCoachUserSchema, searchUsersSchema } from "@/schemas/open.schema";
import { auditStatement } from "@/server/open/audit-write";
import { orNotFound, requireOpenAdmin, runOpenBatch } from "@/server/open/write";

const USER_SEARCH_LIMIT = 20;

function displayName({ firstName, lastName, email }: { firstName: string | null; lastName: string | null; email: string | null }) {
  return [firstName, lastName].filter(Boolean).join(" ") || email || "user";
}

/** Links (or with `userId: null` unlinks) a coach profile to a login, enabling the coach workspace. */
export const linkCoachUserAction = createServerAction()
  .input(linkCoachUserSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { coachId, userId } = input;

    const coach = await orNotFound({
      row: db.query.coachTable.findFirst({
        where: eq(coachTable.id, coachId),
        columns: { id: true, name: true, slug: true, userId: true },
      }),
      label: "Coach",
    });
    if (coach.userId === userId) return coach;

    const user = userId
      ? await orNotFound({
          row: db.query.userTable.findFirst({
            where: eq(userTable.id, userId),
            columns: { id: true, firstName: true, lastName: true, email: true },
          }),
          label: "User",
        })
      : null;
    if (userId) {
      const linkedElsewhere = await db.query.coachTable.findFirst({
        where: eq(coachTable.userId, userId),
        columns: { name: true },
      });
      if (linkedElsewhere) throw new ZSAError("CONFLICT", `That user is already linked to ${linkedElsewhere.name}`);
    }

    const after = { ...coach, userId };
    await runOpenBatch({
      db,
      statements: [
        db.update(coachTable).set({ userId }).where(eq(coachTable.id, coachId)),
        auditStatement({
          db,
          eventId: null,
          actorUserId: session.userId,
          verb: OPEN_AUDIT_VERB.UPDATE,
          entityType: OPEN_AUDIT_ENTITY.COACH,
          entityId: coachId,
          before: coach,
          after,
          summary: user ? `Linked coach ${coach.name} to ${displayName(user)}` : `Unlinked coach ${coach.name} from their login`,
        }),
      ],
      messages: { unique: "That user is already linked to another coach" },
    });

    revalidatePath("/admin/coaches");
    // Manageable teams for every event depend on this link
    revalidatePath("/open", "layout");
    return after;
  });

/** Admin user picker for the coach link (name/email contains, max 20). */
export const searchOpenUsersAction = createServerAction()
  .input(searchUsersSchema)
  .handler(async ({ input }) => {
    await requireOpenAdmin();
    const db = getDB();
    const pattern = `%${input.query.replace(/[%_\\]/g, "")}%`;

    return db
      .select({
        id: userTable.id,
        email: userTable.email,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
      })
      .from(userTable)
      .where(
        or(
          like(userTable.email, pattern),
          like(sql`coalesce(${userTable.firstName}, '') || ' ' || coalesce(${userTable.lastName}, '')`, pattern),
        ),
      )
      .orderBy(asc(userTable.email))
      .limit(USER_SEARCH_LIMIT);
  });
