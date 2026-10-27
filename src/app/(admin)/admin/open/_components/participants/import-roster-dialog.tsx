"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import { useServerAction } from "zsa-react"
import { importRosterAction } from "@/actions/open/roster.action"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { actionErrorMessage } from "@/components/open/action-error"
import { Field } from "@/components/open/field"
import { formOptionalId, formText, NONE } from "@/lib/open/form-data"
import { OptionalIdSelect } from "@/components/open/selects"
import type { TeamOption } from "./types"

type ImportResult = NonNullable<Awaited<ReturnType<typeof importRosterAction>>[0]>

/** Paste names (one per line, optional ", email"); shows what was created, reused, and skipped. */
export function ImportRosterDialog({ eventId, teams, trigger }: { eventId: string; teams: TeamOption[]; trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { execute, isPending } = useServerAction(importRosterAction)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setError(null)
    const [data, err] = await execute({
      eventId,
      text: formText({ formData, name: "text" }) ?? "",
      teamId: formOptionalId({ formData, name: "teamId" }),
    })
    if (err) setError(actionErrorMessage({ err, fallback: "Failed to import roster" }))
    else setResult(data)
  }

  function handleOpenChange(next: boolean) {
    if (isPending) return
    setOpen(next)
    if (!next) {
      setResult(null)
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import roster</DialogTitle>
          <DialogDescription>
            One athlete per line: <code>Name</code> or <code>Name, email</code> (tabs from a spreadsheet work too). Blank lines
            and lines starting with # are ignored.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="grid gap-3 text-sm">
            <p className="font-medium">Added {result.created} athlete(s) to the event.</p>
            {result.reused.length > 0 && (
              <SummaryList
                title={`Matched ${result.reused.length} existing person(s)`}
                items={result.reused.map(
                  (item) => `${item.name} → ${item.participantName}${item.priorEvents > 0 ? ` (${item.priorEvents} prior event(s))` : ""}`,
                )}
              />
            )}
            {result.skipped.length > 0 && (
              <SummaryList
                title={`Skipped ${result.skipped.length}`}
                items={result.skipped.map((item) => `${item.name}: ${item.reason}`)}
              />
            )}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setResult(null)}>
                Import more
              </Button>
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <Field id="roster-text" label="Athletes *">
              <Textarea id="roster-text" name="text" required rows={10} placeholder={"Jane Doe, jane@example.com\nJohn Smith"} />
            </Field>
            <Field id="roster-team" label="Team" hint="Optional; everyone imported goes on this team.">
              <OptionalIdSelect id="roster-team" name="teamId" defaultValue={NONE} items={teams} noneLabel="No team" />
            </Field>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Importing..." : "Import"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function SummaryList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="grid gap-1">
      <p className="font-medium">{title}</p>
      <ul className="max-h-40 list-disc overflow-y-auto pl-5 text-muted-foreground">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
