"use client"

import type { FormEvent } from "react"
import { toast } from "sonner"
import { useServerAction } from "zsa-react"
import { saveOpenEventSettingsAction } from "../../../_actions/open-event-navigation.action"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { OpenEvent } from "@/db/schema"
import { toastResult } from "@/components/open/action-error"
import { Field, SwitchField } from "@/components/open/field"
import { formBool, formInt, formText } from "@/lib/open/form-data"
import { EventStatusSelect, ThemeSelect, WeightUnitSelect } from "@/components/open/selects"

export function EventSettingsForm({ event }: { event: OpenEvent }) {
  const { execute, isPending } = useServerAction(saveOpenEventSettingsAction)

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    const formData = new FormData(formEvent.currentTarget)
    // A slug change redirects from the action, so this only resolves for in-place saves
    const [data, err] = await execute({
      eventId: event.id,
      currentSlug: event.slug,
      name: formText({ formData, name: "name" }) ?? "",
      slug: formText({ formData, name: "slug" }) ?? event.slug,
      year: formInt({ formData, name: "year" }),
      status: formText({ formData, name: "status" }),
      weightUnit: formText({ formData, name: "weightUnit" }),
      showIndividuals: formBool({ formData, name: "showIndividuals" }),
      coachPointsEnabled: formBool({ formData, name: "coachPointsEnabled" }),
      coachScoresEnabled: formBool({ formData, name: "coachScoresEnabled" }),
      autoRosterCoaches: formBool({ formData, name: "autoRosterCoaches" }),
      theme: formText({ formData, name: "theme" }),
    })
    const added = data?.roster.added ?? 0
    if (toastResult({ err, success: added > 0 ? `Event saved; added ${added} coach(es) to rosters` : "Event saved", fallback: "Failed to save event" })) {
      for (const note of data?.roster.notes ?? []) toast.info(note)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Event settings</CardTitle>
          <CardDescription>Status controls what&apos;s public: draft events are hidden, live events are current.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field id="settings-name" label="Name *">
            <Input id="settings-name" name="name" required defaultValue={event.name} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="settings-slug" label="Slug *" hint="Changing it changes the public URL.">
              <Input id="settings-slug" name="slug" required defaultValue={event.slug} />
            </Field>
            <Field id="settings-year" label="Year *">
              <Input id="settings-year" name="year" type="number" required min={2000} max={2100} defaultValue={event.year} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="settings-status" label="Status">
              <EventStatusSelect id="settings-status" name="status" defaultValue={event.status} />
            </Field>
            <Field id="settings-weight-unit" label="Weight unit">
              <WeightUnitSelect id="settings-weight-unit" name="weightUnit" defaultValue={event.weightUnit} />
            </Field>
          </div>
          <Field id="settings-theme" label="Public page theme" hint="The look of the public leaderboard, team, and workout pages.">
            <ThemeSelect id="settings-theme" name="theme" defaultValue={event.theme} />
          </Field>
          <SwitchField id="settings-show-individuals" label="Show individuals" hint="Show the top-individuals list on the public leaderboard.">
            <Switch id="settings-show-individuals" name="showIndividuals" defaultChecked={event.showIndividuals} />
          </SwitchField>
          <SwitchField id="settings-coach-points" label="Coaches award points" hint="Linked coaches can award points to their teams' athletes.">
            <Switch id="settings-coach-points" name="coachPointsEnabled" defaultChecked={event.coachPointsEnabled} />
          </SwitchField>
          <SwitchField id="settings-coach-scores" label="Coaches enter scores" hint="Linked coaches can enter workout scores for their teams' athletes.">
            <Switch id="settings-coach-scores" name="coachScoresEnabled" defaultChecked={event.coachScoresEnabled} />
          </SwitchField>
          <SwitchField
            id="settings-auto-roster"
            label="Automatically add coaches to their team's roster"
            hint="Coaches compete too: assigning a coach to a team also enters them as an athlete on it (turning this on adds current coaches)."
          >
            <Switch id="settings-auto-roster" name="autoRosterCoaches" defaultChecked={event.autoRosterCoaches} />
          </SwitchField>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save settings"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
