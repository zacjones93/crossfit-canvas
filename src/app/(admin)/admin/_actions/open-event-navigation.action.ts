"use server"

import type { Route } from "next"
import { redirect } from "next/navigation"
import { createServerAction } from "zsa"
import { z } from "zod"
import { deleteOpenEventAction, updateOpenEventAction } from "@/actions/open/events.action"
import { openEventIdSchema, updateOpenEventSchema } from "@/schemas/open.schema"

// Admin settings flows that leave the current URL. Redirecting from the action makes Next render
// the destination in the action response; navigating from the client afterwards would first
// re-render the old (now missing) slug as a 404.

/** Saves event settings; when the slug changed, redirects to the settings page at the new slug. */
export const saveOpenEventSettingsAction = createServerAction()
  .input(updateOpenEventSchema.extend({ currentSlug: z.string().min(1) }))
  .handler(async ({ input }) => {
    const { currentSlug, ...updates } = input
    const [event, err] = await updateOpenEventAction(updates)
    if (err) throw err
    if (event.slug !== currentSlug) redirect(`/admin/open/${event.slug}/settings` as Route)
    return event
  })

/** Deletes an (empty draft) event and redirects to the events list. */
export const deleteOpenEventFromAdminAction = createServerAction()
  .input(openEventIdSchema)
  .handler(async ({ input }) => {
    const [, err] = await deleteOpenEventAction(input)
    if (err) throw err
    redirect("/admin/open")
  })
