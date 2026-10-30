"use client"

import { useMemo, useState } from "react"
import { Pencil, Upload } from "lucide-react"
import { useServerAction } from "zsa-react"
import { bulkAssignTeamsAction, updateOpenEntryAction } from "@/actions/open/roster.action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toastResult } from "@/components/open/action-error"
import { NONE } from "@/lib/open/form-data"
import { GenderSelect, OptionalIdSelect, OptionSelect } from "@/components/open/selects"
import { EntryFormDialog } from "./entry-form-dialog"
import { ImportRosterDialog } from "./import-roster-dialog"
import { RemoveEntryButton } from "./remove-entry-button"
import type { AdminOpenEntry, TeamOption } from "./types"

const ALL = "__all__"

interface ParticipantsManagerProps {
  eventId: string
  entries: AdminOpenEntry[]
  teams: TeamOption[]
  /** For linking an athlete to their coach profile (coaches compete too) */
  coaches: TeamOption[]
}

export function ParticipantsManager({ eventId, entries, teams, coaches }: ParticipantsManagerProps) {
  const [query, setQuery] = useState("")
  const [teamFilter, setTeamFilter] = useState(ALL)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkTeamId, setBulkTeamId] = useState<string>("")
  const { execute: updateEntry } = useServerAction(updateOpenEntryAction)
  const { execute: bulkAssign, isPending: isBulkAssigning } = useServerAction(bulkAssignTeamsAction)

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return entries.filter((entry) => {
      if (teamFilter === NONE ? entry.teamId : teamFilter !== ALL && entry.teamId !== teamFilter) return false
      if (!needle) return true
      return (
        entry.participant.name.toLowerCase().includes(needle) ||
        (entry.participant.email ?? "").toLowerCase().includes(needle)
      )
    })
  }, [entries, query, teamFilter])

  // Drop selections that are no longer visible/present
  const selectedVisible = visible.filter((entry) => selectedIds.has(entry.id))
  const allVisibleSelected = visible.length > 0 && selectedVisible.length === visible.length

  function toggle(entryId: string) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(entryId)) next.delete(entryId)
      else next.add(entryId)
      return next
    })
  }

  function toggleAllVisible() {
    setSelectedIds(allVisibleSelected ? new Set() : new Set(visible.map((entry) => entry.id)))
  }

  async function handleTeamChange({ entry, value }: { entry: AdminOpenEntry; value: string }) {
    const teamId = value === NONE ? null : value
    const [, err] = await updateEntry({ entryId: entry.id, teamId })
    toastResult({ err, success: `Moved ${entry.participant.name}`, fallback: "Failed to change team" })
  }

  async function handleGenderChange({ entry, value }: { entry: AdminOpenEntry; value: string }) {
    const gender = value === NONE ? null : value
    const [, err] = await updateEntry({ entryId: entry.id, gender })
    toastResult({ err, success: `Updated ${entry.participant.name}`, fallback: "Failed to change gender" })
  }

  async function handleBulkAssign() {
    if (!bulkTeamId || selectedVisible.length === 0) return
    const teamId = bulkTeamId === NONE ? null : bulkTeamId
    const [data, err] = await bulkAssign({
      eventId,
      assignments: selectedVisible.map((entry) => ({ entryId: entry.id, teamId })),
    })
    if (toastResult({ err, success: `Moved ${data?.moved ?? 0} athlete(s)`, fallback: "Failed to assign teams" })) {
      setSelectedIds(new Set())
      setBulkTeamId("")
    }
  }

  const teamOptions = [{ value: NONE, label: "No team" }, ...teams.map((team) => ({ value: team.id, label: team.label }))]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <Input
            type="search"
            placeholder="Search name or email..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="sm:max-w-xs"
          />
          <OptionSelect
            value={teamFilter}
            onValueChange={setTeamFilter}
            options={[{ value: ALL, label: "All teams" }, ...teamOptions]}
            className="sm:w-48"
          />
        </div>
        <ImportRosterDialog
          eventId={eventId}
          teams={teams}
          trigger={
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Import roster
            </Button>
          }
        />
      </div>

      {selectedVisible.length > 0 && (
        <div className="flex flex-col gap-2 rounded-md border bg-muted/50 p-3 sm:flex-row sm:items-center">
          <span className="text-sm font-medium">{selectedVisible.length} selected</span>
          <OptionSelect
            value={bulkTeamId}
            onValueChange={setBulkTeamId}
            placeholder="Move to team..."
            options={teamOptions}
            className="h-9 sm:w-48"
          />
          <Button size="sm" onClick={handleBulkAssign} disabled={!bulkTeamId || isBulkAssigning}>
            {isBulkAssigning ? "Moving..." : "Move"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        {visible.length === entries.length ? `${entries.length} athlete(s)` : `${visible.length} of ${entries.length} athlete(s)`}
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  aria-label="Select all visible"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  className="h-4 w-4 accent-primary"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead className="hidden sm:table-cell">Division</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  {entries.length === 0 ? "No athletes yet. Import a roster to get started." : "No athletes match."}
                </TableCell>
              </TableRow>
            ) : (
              visible.map((entry) => (
                <TableRow key={entry.id} data-state={selectedIds.has(entry.id) ? "selected" : undefined}>
                  <TableCell>
                    <input
                      type="checkbox"
                      aria-label={`Select ${entry.participant.name}`}
                      checked={selectedIds.has(entry.id)}
                      onChange={() => toggle(entry.id)}
                      className="h-4 w-4 accent-primary"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      {entry.participant.name}
                      {entry.participant.coach && (
                        <Badge variant="secondary" title={`Linked to coach ${entry.participant.coach.name}`}>
                          Coach profile
                        </Badge>
                      )}
                    </span>
                    <div className="text-xs font-normal text-muted-foreground md:hidden">{entry.participant.email}</div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{entry.participant.email ?? "--"}</TableCell>
                  <TableCell>
                    <OptionalIdSelect
                      value={entry.teamId ?? NONE}
                      onValueChange={(value) => handleTeamChange({ entry, value })}
                      items={teams}
                      noneLabel="No team"
                      className="h-9 w-36 sm:w-44"
                    />
                  </TableCell>
                  <TableCell>
                    <GenderSelect
                      value={entry.participant.gender ?? NONE}
                      onValueChange={(value) => handleGenderChange({ entry, value })}
                      className="h-9 w-28"
                    />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{entry.division ?? <span className="text-muted-foreground">--</span>}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <EntryFormDialog
                        entry={entry}
                        teams={teams}
                        coaches={coaches}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label={`Edit ${entry.participant.name}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <RemoveEntryButton entry={entry} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
