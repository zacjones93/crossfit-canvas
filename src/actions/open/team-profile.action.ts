"use server";

import { createServerAction } from "zsa";
import { getDB } from "@/db";
import { openTeamTable } from "@/db/schema";
import { OPEN_AUDIT_ENTITY } from "@/lib/open/constants";
import { openTeamProfileRefSchema, updateTeamProfileSchema } from "@/schemas/open.schema";
import { assertCanManageTeam } from "@/server/open/permissions";
import { removeTeamPhoto } from "@/server/open/team-photo";
import { auditedUpdate, requireOpenSession, revalidateOpenEvent } from "@/server/open/write";

// Team profile edits: admins on any team in the event, coaches on teams they coach (not gated by
// coach event flags or week locks). Name/slug/color/sortOrder stay in the admin-only teams actions.
// Photo upload is a route handler (POST /api/open/team-photo) to avoid raising the global
// server-action body limit.

export const updateTeamProfileAction = createServerAction()
  .input(updateTeamProfileSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenSession();
    const { eventId, teamId, ...updates } = input;
    const team = await assertCanManageTeam({ session, eventId, teamId });

    const { row, changed } = await auditedUpdate({
      db: getDB(),
      table: openTeamTable,
      entityType: OPEN_AUDIT_ENTITY.TEAM,
      eventId,
      actorUserId: session.userId,
      row: team,
      updates,
      describe: ({ after, changedKeys }) => `Updated team "${after.name}" profile (${changedKeys.join(", ")})`,
    });

    if (changed) revalidateOpenEvent({ eventId });
    return row;
  });

export const removeTeamPhotoAction = createServerAction()
  .input(openTeamProfileRefSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenSession();
    return removeTeamPhoto({ session, ...input });
  });
