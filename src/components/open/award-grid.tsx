"use client"

import { Fragment, useMemo, useOptimistic, useTransition } from "react"
import { Lock, Minus, Plus } from "lucide-react"
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs"
import { toast } from "sonner"
import {
  addUnlimitedAwardAction,
  removeAwardAction,
  setAwardAction,
  setAwardsForEntriesAction,
} from "@/actions/open/awards.action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OPEN_RULE_CADENCE } from "@/lib/open/constants"
import { AWARD_EVENT_VIEW } from "@/lib/open/grid"
import { cn } from "@/lib/utils"
import { actionErrorMessage } from "./action-error"
import { EntryFilterBar, useEntryFilter, type GridEntry } from "./entry-filter"
import { TeamSwatch } from "./team-swatch"

export interface AwardGridWeek {
  id: string
  number: number
  label: string
  lockedAt: Date | null
}

export interface AwardGridRule {
  id: string
  name: string
  points: number
  cadence: string
  coachAwardable: boolean
  isActive: boolean
}

export interface AwardGridAward {
  id: string
  entryId: string
  ruleId: string
  points: number
}

interface AwardGridProps {
  eventId: string
  weeks: AwardGridWeek[]
  /** The selected week (from `?week=`); null = the event-level view. */
  selectedWeekId: string | null
  /** The view's columns, in order (see `rulesForView`). */
  rules: AwardGridRule[]
  entries: GridEntry[]
  /** Awards in the selected view only. */
  awards: AwardGridAward[]
  /** Rule ids this viewer may change in the selected view (decided server-side). */
  editableRuleIds: string[]
  /** Whether the selected week is locked, and whether that lock stops this viewer. */
  lock: { isLocked: boolean; appliesToViewer: boolean }
}

const MODES = ["grid", "rule"] as const
type Mode = (typeof MODES)[number]

type AwardChange =
  | { type: "toggle"; entryId: string; rule: AwardGridRule; awarded: boolean }
  | { type: "bulk"; rule: AwardGridRule; entryIds: ReadonlySet<string>; awarded: boolean }
  | { type: "add"; entryId: string; rule: AwardGridRule }
  | { type: "remove"; awardId: string }

const PENDING_ID = "pending:"

function applyChange(awards: AwardGridAward[], change: AwardChange): AwardGridAward[] {
  const pending = (entryId: string, rule: AwardGridRule): AwardGridAward => ({
    id: `${PENDING_ID}${entryId}:${rule.id}:${Math.random()}`,
    entryId,
    ruleId: rule.id,
    points: rule.points,
  })
  switch (change.type) {
    case "toggle": {
      const rest = awards.filter((award) => !(award.entryId === change.entryId && award.ruleId === change.rule.id))
      return change.awarded ? [...rest, pending(change.entryId, change.rule)] : rest
    }
    case "bulk": {
      const inBulk = (award: AwardGridAward) => award.ruleId === change.rule.id && change.entryIds.has(award.entryId)
      if (!change.awarded) return awards.filter((award) => !inBulk(award))
      const has = new Set(awards.filter(inBulk).map((award) => award.entryId))
      return [...awards, ...[...change.entryIds].filter((entryId) => !has.has(entryId)).map((entryId) => pending(entryId, change.rule))]
    }
    case "add":
      return [...awards, pending(change.entryId, change.rule)]
    case "remove":
      return awards.filter((award) => award.id !== change.awardId)
  }
}

const cellKey = ({ entryId, ruleId }: { entryId: string; ruleId: string }) => `${entryId}:${ruleId}`

/**
 * Points grid: athletes × rules for one week (or the event view). Keyed rules toggle with a
 * checkbox (optimistic, rolled back with a toast on error); repeatable rules show a count with
 * +/−. Small screens default to "by rule": pick a rule, then tick athletes.
 */
export function AwardGrid({
  eventId,
  weeks,
  selectedWeekId,
  rules,
  entries,
  awards,
  editableRuleIds,
  lock,
}: AwardGridProps) {
  const [, setWeekParam] = useQueryState("week", parseAsString.withOptions({ shallow: false }))
  const [mode, setMode] = useQueryState("mode", parseAsStringLiteral(MODES))
  const [ruleParam, setRuleParam] = useQueryState("rule", parseAsString)

  const [optimisticAwards, applyOptimistic] = useOptimistic(awards, applyChange)
  const [, startTransition] = useTransition()

  const filter = useEntryFilter(entries)
  const editable = useMemo(() => new Set(editableRuleIds), [editableRuleIds])
  const isEventView = selectedWeekId === null
  const cells = useMemo(() => {
    const byCell = new Map<string, AwardGridAward[]>()
    for (const award of optimisticAwards) {
      const key = cellKey(award)
      byCell.set(key, [...(byCell.get(key) ?? []), award])
    }
    return byCell
  }, [optimisticAwards])

  // Actions are called directly (they return [data, err]) rather than via zsa-react's
  // useServerAction: its `execute` resolves only after its own transition commits, which never
  // happens while this optimistic transition is pending, so the two would deadlock.
  function run({ change, request, fallback }: { change: AwardChange; request: () => Promise<[unknown, unknown]>; fallback: string }) {
    startTransition(async () => {
      applyOptimistic(change)
      const [, err] = await request()
      if (err) toast.error(actionErrorMessage({ err, fallback }))
    })
  }

  function toggle({ entryId, rule, awarded }: { entryId: string; rule: AwardGridRule; awarded: boolean }) {
    run({
      change: { type: "toggle", entryId, rule, awarded },
      request: () => setAwardAction({ eventId, entryId, ruleId: rule.id, weekId: selectedWeekId, awarded }),
      fallback: "Failed to update award",
    })
  }

  function add({ entryId, rule }: { entryId: string; rule: AwardGridRule }) {
    run({
      change: { type: "add", entryId, rule },
      request: () => addUnlimitedAwardAction({ eventId, entryId, ruleId: rule.id, weekId: selectedWeekId }),
      fallback: "Failed to add award",
    })
  }

  function remove({ entryId, rule }: { entryId: string; rule: AwardGridRule }) {
    const award = cells.get(cellKey({ entryId, ruleId: rule.id }))?.findLast((item) => !item.id.startsWith(PENDING_ID))
    if (!award) return
    run({
      change: { type: "remove", awardId: award.id },
      request: () => removeAwardAction({ eventId, awardId: award.id }),
      fallback: "Failed to remove award",
    })
  }

  /** Ticks (or, when all are ticked, clears) exactly the visible athletes for a keyed rule. */
  function toggleVisible(rule: AwardGridRule) {
    const entryIds = filter.visible.map((entry) => entry.id)
    const awarded = !entryIds.every((entryId) => cells.has(cellKey({ entryId, ruleId: rule.id })))
    run({
      change: { type: "bulk", rule, entryIds: new Set(entryIds), awarded },
      request: () => setAwardsForEntriesAction({ eventId, ruleId: rule.id, weekId: selectedWeekId, entryIds, awarded }),
      fallback: "Failed to update awards",
    })
  }

  const cellProps = { cells, editable, onToggle: toggle, onAdd: add, onRemove: remove }
  const selectedRule = rules.find((rule) => rule.id === ruleParam) ?? rules[0] ?? null

  return (
    <div className="flex flex-col gap-4">
      <WeekTabs
        weeks={weeks}
        selectedWeekId={selectedWeekId}
        onSelect={(value) => void setWeekParam(value)}
      />

      {lock.isLocked && (
        <p className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
          <Lock aria-hidden className="h-4 w-4 shrink-0" />
          {lock.appliesToViewer
            ? "This week is locked. Points are read-only."
            : "This week is locked for coaches. Admins can still edit."}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <EntryFilterBar filter={filter} />
        <ModeSwitch mode={mode} onChange={(value) => void setMode(value)} />
      </div>

      {rules.length === 0 ? (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          {isEventView ? "No once-per-event or repeatable rules yet." : "No weekly or repeatable rules yet."}
        </p>
      ) : entries.length === 0 ? (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No athletes yet.</p>
      ) : (
        <>
          <div className={cn(mode === "grid" ? "block" : mode === "rule" ? "hidden" : "hidden md:block")}>
            <MatrixView
              columns={rules}
              groups={filter.groups}
              visibleCount={filter.visible.length}
              onToggleVisible={toggleVisible}
              {...cellProps}
            />
          </div>
          <div className={cn(mode === "rule" ? "block" : mode === "grid" ? "hidden" : "md:hidden")}>
            {selectedRule && (
              <ByRuleView
                columns={rules}
                rule={selectedRule}
                onSelectRule={(ruleId) => void setRuleParam(ruleId)}
                visible={filter.visible}
                onToggleVisible={toggleVisible}
                {...cellProps}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}

function WeekTabs({
  weeks,
  selectedWeekId,
  onSelect,
}: {
  weeks: AwardGridWeek[]
  selectedWeekId: string | null
  onSelect: (value: string) => void
}) {
  const tabs = [
    ...weeks.map((week) => ({ key: week.id, value: String(week.number), label: week.label, isLocked: !!week.lockedAt })),
    { key: AWARD_EVENT_VIEW, value: AWARD_EVENT_VIEW, label: "Event", isLocked: false },
  ]
  const selectedKey = selectedWeekId ?? AWARD_EVENT_VIEW

  return (
    <div role="tablist" aria-label="Week" className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {tabs.map((tab) => (
        <Button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={tab.key === selectedKey}
          size="sm"
          variant={tab.key === selectedKey ? "default" : "outline"}
          className="shrink-0"
          onClick={() => onSelect(tab.value)}
        >
          {tab.isLocked && <Lock aria-label="Locked" className="mr-1 h-3.5 w-3.5" />}
          {tab.label}
        </Button>
      ))}
    </div>
  )
}

function ModeSwitch({ mode, onChange }: { mode: Mode | null; onChange: (mode: Mode) => void }) {
  const active = "bg-primary text-primary-foreground hover:bg-primary/90"
  // With no explicit mode, small screens show "by rule" and larger ones the grid
  const activeClass = (value: Mode) =>
    mode ? (mode === value ? active : "") : value === "rule" ? "max-md:bg-primary max-md:text-primary-foreground" : "md:bg-primary md:text-primary-foreground"

  return (
    <div className="inline-flex shrink-0 self-start rounded-md border p-0.5" role="group" aria-label="Layout">
      {MODES.map((value) => (
        <Button
          key={value}
          type="button"
          size="sm"
          variant="ghost"
          className={cn("h-8", activeClass(value))}
          onClick={() => onChange(value)}
        >
          {value === "grid" ? "Grid" : "By rule"}
        </Button>
      ))}
    </div>
  )
}

interface CellProps {
  cells: Map<string, AwardGridAward[]>
  editable: ReadonlySet<string>
  onToggle: (args: { entryId: string; rule: AwardGridRule; awarded: boolean }) => void
  onAdd: (args: { entryId: string; rule: AwardGridRule }) => void
  onRemove: (args: { entryId: string; rule: AwardGridRule }) => void
}

function AwardControl({
  entry,
  rule,
  cells,
  editable,
  onToggle,
  onAdd,
  onRemove,
  size = "sm",
}: CellProps & { entry: GridEntry; rule: AwardGridRule; size?: "sm" | "lg" }) {
  const awards = cells.get(cellKey({ entryId: entry.id, ruleId: rule.id })) ?? []
  const canEdit = editable.has(rule.id)
  const label = `${rule.name} for ${entry.name}`

  if (rule.cadence === OPEN_RULE_CADENCE.UNLIMITED) {
    const hasRemovable = awards.some((award) => !award.id.startsWith(PENDING_ID))
    const buttonClass = size === "lg" ? "h-10 w-10" : "h-7 w-7"
    return (
      <div className="inline-flex items-center gap-1">
        {canEdit && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={buttonClass}
            aria-label={`Remove one ${label}`}
            disabled={!hasRemovable}
            onClick={() => onRemove({ entryId: entry.id, rule })}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
        )}
        <span className={cn("min-w-6 text-center tabular-nums", awards.length === 0 && "text-muted-foreground")} aria-label={`${label}: ${awards.length}`}>
          {awards.length}
        </span>
        {canEdit && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={buttonClass}
            aria-label={`Add one ${label}`}
            onClick={() => onAdd({ entryId: entry.id, rule })}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    )
  }

  const isAwarded = awards.length > 0
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={isAwarded}
      disabled={!canEdit}
      onChange={(event) => onToggle({ entryId: entry.id, rule, awarded: event.target.checked })}
      className={cn("cursor-pointer accent-primary disabled:cursor-not-allowed", size === "lg" ? "h-6 w-6" : "h-5 w-5")}
    />
  )
}

function pointsFor({ cells, entryId, columns }: { cells: CellProps["cells"]; entryId: string; columns: AwardGridRule[] }) {
  return columns.reduce(
    (sum, rule) => sum + (cells.get(cellKey({ entryId, ruleId: rule.id })) ?? []).reduce((total, award) => total + award.points, 0),
    0,
  )
}

function MatrixView({
  columns,
  groups,
  visibleCount,
  onToggleVisible,
  ...cellProps
}: CellProps & {
  columns: AwardGridRule[]
  groups: ReturnType<typeof useEntryFilter>["groups"]
  visibleCount: number
  onToggleVisible: (rule: AwardGridRule) => void
}) {
  const { cells, editable } = cellProps
  const visible = groups.flatMap((group) => group.entries)
  const columnCount = (rule: AwardGridRule) =>
    visible.reduce((sum, entry) => sum + (cells.get(cellKey({ entryId: entry.id, ruleId: rule.id }))?.length ?? 0), 0)
  const grandTotal = visible.reduce((sum, entry) => sum + pointsFor({ cells, entryId: entry.id, columns }), 0)
  const showGroups = groups.length > 1
  const stickyCell = "sticky left-0 z-10 bg-background"

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th scope="col" className={cn(stickyCell, "min-w-40 px-3 py-2 text-left font-medium")}>
              Athlete
            </th>
            {columns.map((rule) => {
              const isKeyed = rule.cadence !== OPEN_RULE_CADENCE.UNLIMITED
              const allTicked = visible.length > 0 && visible.every((entry) => cells.has(cellKey({ entryId: entry.id, ruleId: rule.id })))
              return (
                <th key={rule.id} scope="col" className="min-w-24 px-2 py-2 text-center align-bottom font-medium">
                  <div className="flex flex-col items-center gap-1">
                    <span className="flex items-center gap-1 leading-tight">
                      {!editable.has(rule.id) && <Lock aria-label="Read-only" className="h-3 w-3 text-muted-foreground" />}
                      {rule.name}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {rule.points} pts{rule.cadence === OPEN_RULE_CADENCE.UNLIMITED && " each"}
                      {!rule.isActive && " · retired"}
                    </span>
                    {isKeyed && editable.has(rule.id) && visibleCount > 0 && (
                      <input
                        type="checkbox"
                        aria-label={`${allTicked ? "Clear" : "Award"} ${rule.name} for all ${visibleCount} shown`}
                        title={`${allTicked ? "Clear" : "Award"} all shown`}
                        checked={allTicked}
                        onChange={() => onToggleVisible(rule)}
                        className="h-4 w-4 cursor-pointer accent-primary"
                      />
                    )}
                  </div>
                </th>
              )
            })}
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.key}>
              {showGroups && (
                <tr className="border-b bg-muted/50">
                  <th scope="rowgroup" colSpan={columns.length + 2} className="px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-wide">
                    <span className={cn(stickyCell, "inline-flex items-center gap-2 bg-transparent")}>
                      <TeamSwatch color={group.team?.color ?? null} />
                      {group.team?.name ?? "No team"}
                    </span>
                  </th>
                </tr>
              )}
              {group.entries.map((entry) => (
                <tr key={entry.id} className="border-b last:border-b-0 hover:bg-muted/30">
                  <th scope="row" className={cn(stickyCell, "px-3 py-1.5 text-left font-normal")}>
                    {entry.name}
                  </th>
                  {columns.map((rule) => (
                    <td key={rule.id} className="px-2 py-1.5 text-center">
                      <AwardControl entry={entry} rule={rule} {...cellProps} />
                    </td>
                  ))}
                  <td className="px-3 py-1.5 text-right font-medium tabular-nums">{pointsFor({ cells, entryId: entry.id, columns })}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t bg-muted/30 text-xs text-muted-foreground">
            <th scope="row" className={cn(stickyCell, "bg-muted px-3 py-2 text-left font-medium")}>
              Awarded ({visible.length} shown)
            </th>
            {columns.map((rule) => (
              <td key={rule.id} className="px-2 py-2 text-center tabular-nums">
                {columnCount(rule)}
              </td>
            ))}
            <td className="px-3 py-2 text-right text-sm font-semibold text-foreground tabular-nums">{grandTotal}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function ByRuleView({
  columns,
  rule,
  onSelectRule,
  visible,
  onToggleVisible,
  ...cellProps
}: CellProps & {
  columns: AwardGridRule[]
  rule: AwardGridRule
  onSelectRule: (ruleId: string) => void
  visible: GridEntry[]
  onToggleVisible: (rule: AwardGridRule) => void
}) {
  const { cells, editable } = cellProps
  const isKeyed = rule.cadence !== OPEN_RULE_CADENCE.UNLIMITED
  const awardedCount = visible.filter((entry) => cells.has(cellKey({ entryId: entry.id, ruleId: rule.id }))).length
  const allTicked = visible.length > 0 && awardedCount === visible.length

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="Rule" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {columns.map((column) => (
          <button
            key={column.id}
            type="button"
            role="tab"
            aria-selected={column.id === rule.id}
            onClick={() => onSelectRule(column.id)}
            className={cn(
              "flex shrink-0 flex-col items-start rounded-md border px-3 py-2 text-left text-sm transition-colors",
              column.id === rule.id ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            <span className="flex items-center gap-1 font-medium">
              {!editable.has(column.id) && <Lock aria-label="Read-only" className="h-3 w-3" />}
              {column.name}
            </span>
            <span className="text-xs opacity-80">{column.points} pts</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {isKeyed ? `${awardedCount} of ${visible.length} awarded` : `${visible.length} athletes`}
        </p>
        {isKeyed && editable.has(rule.id) && visible.length > 0 && (
          <Button type="button" variant="outline" size="sm" onClick={() => onToggleVisible(rule)}>
            {allTicked ? "Clear all" : `Award all ${visible.length}`}
          </Button>
        )}
      </div>

      <ul className="divide-y rounded-md border">
        {visible.map((entry) => {
          const content = (
            <>
              <span className="flex min-w-0 items-center gap-2">
                {entry.team && <TeamSwatch color={entry.team.color} />}
                <span className="truncate">{entry.name}</span>
              </span>
              <AwardControl entry={entry} rule={rule} size="lg" {...cellProps} />
            </>
          )
          return (
            <li key={entry.id}>
              {isKeyed ? (
                // The whole row is the label, so the tap target is the full width
                <label className={cn("flex min-h-12 items-center justify-between gap-3 px-3 py-2", editable.has(rule.id) && "cursor-pointer active:bg-muted")}>
                  {content}
                </label>
              ) : (
                <div className="flex min-h-12 items-center justify-between gap-3 px-3 py-2">{content}</div>
              )}
            </li>
          )
        })}
      </ul>
      {!rule.isActive && <Badge variant="secondary" className="self-start">Retired rule</Badge>}
    </div>
  )
}
