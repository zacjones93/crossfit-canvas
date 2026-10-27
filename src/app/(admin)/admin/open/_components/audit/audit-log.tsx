"use client"

import { Fragment, useState, type FormEvent } from "react"
import { ChevronDown, ChevronRight, X } from "lucide-react"
import { parseAsString, useQueryStates } from "nuqs"
import { toast } from "sonner"
import { useServerAction } from "zsa-react"
import { getOpenAuditLogAction } from "../../../_actions/open-audit.action"
import { LocalTime } from "@/components/open/local-time"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { openAuditEntityTuple, OPEN_AUDIT_VERB } from "@/lib/open/constants"
import { cn } from "@/lib/utils"
import { actionErrorMessage } from "@/components/open/action-error"
import { OptionSelect } from "@/components/open/selects"
import { AuditDiff } from "./audit-diff"
import type { AuditFilters, AuditPage, AuditRow } from "./types"

const ANY = "__any__"

const VERB_CLASS: Record<string, string> = {
  [OPEN_AUDIT_VERB.CREATE]: "border-transparent bg-emerald-600 text-white hover:bg-emerald-600/80 dark:bg-emerald-500",
  [OPEN_AUDIT_VERB.UPDATE]: "border-transparent bg-sky-600 text-white hover:bg-sky-600/80 dark:bg-sky-500",
  [OPEN_AUDIT_VERB.DELETE]: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
}

const filterParsers = {
  actor: parseAsString,
  entityType: parseAsString,
  entityId: parseAsString,
}

interface AuditLogProps {
  eventId: string
  /** Filters the first page was loaded with (from the URL). */
  filters: AuditFilters
  firstPage: AuditPage
}

export function AuditLog({ eventId, filters, firstPage }: AuditLogProps) {
  // shallow: false → the server page reloads the first page for the new filters
  const [, setQuery] = useQueryStates(filterParsers, { shallow: false })
  const [rows, setRows] = useState<AuditRow[]>(firstPage.rows)
  const [cursor, setCursor] = useState(firstPage.nextCursor)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const { execute, isPending } = useServerAction(getOpenAuditLogAction)

  const actorName = filters.actorUserId
    ? rows.find((row) => row.actorUserId === filters.actorUserId)?.actorName ?? filters.actorUserId
    : null
  const hasFilters = !!(filters.actorUserId || filters.entityType || filters.entityId)

  async function loadMore() {
    if (!cursor) return
    const [data, err] = await execute({ eventId, ...filters, cursor })
    if (err || !data) {
      toast.error(actionErrorMessage({ err, fallback: "Failed to load more" }))
      return
    }
    setRows((current) => [...current, ...data.rows])
    setCursor(data.nextCursor)
  }

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleEntityIdSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = new FormData(event.currentTarget).get("entityId")
    void setQuery({ entityId: typeof value === "string" && value.trim() ? value.trim() : null })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <OptionSelect
          value={filters.entityType ?? ANY}
          onValueChange={(value) => void setQuery({ entityType: value === ANY ? null : value })}
          options={[{ value: ANY, label: "All entity types" }, ...openAuditEntityTuple.map((type) => ({ value: type, label: type }))]}
          className="sm:w-48"
        />
        <form onSubmit={handleEntityIdSubmit} className="flex gap-2">
          <Input name="entityId" placeholder="Entity id..." defaultValue={filters.entityId ?? ""} className="sm:w-56" />
          <Button type="submit" variant="outline">
            Filter
          </Button>
        </form>
        {actorName && (
          <Badge variant="secondary" className="gap-1 pr-1">
            Actor: {actorName}
            <button type="button" aria-label="Clear actor filter" onClick={() => void setQuery({ actor: null })} className="rounded-full p-0.5">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {hasFilters && (
          <Button variant="ghost" onClick={() => void setQuery({ actor: null, entityType: null, entityId: null })}>
            Clear filters
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Click an actor, entity type, or entity id to filter by it.</p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead className="whitespace-nowrap">Time</TableHead>
              <TableHead className="hidden md:table-cell">Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="hidden sm:table-cell">Entity</TableHead>
              <TableHead>Summary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No audit entries{hasFilters ? " match these filters" : " yet"}.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const isOpen = expanded.has(row.id)
                return (
                  <Fragment key={row.id}>
                    <TableRow>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-expanded={isOpen}
                          aria-controls={`audit-details-${row.id}`}
                          aria-label={isOpen ? "Hide details" : "Show details"}
                          onClick={() => toggle(row.id)}
                        >
                          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                        <LocalTime value={row.createdAt} format="MMM d, HH:mm:ss" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {row.actorUserId ? (
                          <FilterLink onClick={() => void setQuery({ actor: row.actorUserId })}>{row.actorName ?? "Unknown"}</FilterLink>
                        ) : (
                          <span className="text-muted-foreground">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("capitalize", VERB_CLASS[row.action])}>{row.action}</Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <FilterLink onClick={() => void setQuery({ entityType: row.entityType })}>{row.entityType}</FilterLink>
                      </TableCell>
                      <TableCell className="min-w-48 text-sm">{row.summary ?? <span className="text-muted-foreground">--</span>}</TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow id={`audit-details-${row.id}`} className="bg-muted/30 hover:bg-muted/30">
                        <TableCell />
                        <TableCell colSpan={5} className="space-y-2">
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              {row.entityType}{" "}
                              <FilterLink onClick={() => void setQuery({ entityId: row.entityId })}>
                                <code>{row.entityId}</code>
                              </FilterLink>
                            </span>
                            <span className="md:hidden">by {row.actorName ?? "System"}</span>
                            <LocalTime value={row.createdAt} format="PPpp" />
                          </div>
                          <AuditDiff action={row.action} before={row.before} after={row.after} />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {cursor && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={isPending}>
            {isPending ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  )
}

/** Inline text button that applies a filter. */
function FilterLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left underline-offset-2 hover:underline"
    >
      {children}
    </button>
  )
}
