"use client"

import { useId, useState, type KeyboardEvent } from "react"
import { Eraser, Save } from "lucide-react"
import { parseAsString, useQueryState } from "nuqs"
import { toast } from "sonner"
import { useServerAction } from "zsa-react"
import { clearScoreAction, setScoreAction } from "@/actions/open/scores.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OPEN_SCORE_TYPE } from "@/lib/open/constants"
import { SCORE_TYPE_LABEL, labelFor } from "@/lib/open/labels"
import { formatScore, formatTime, parseScore, parseTime, type ScoreWorkout } from "@/lib/open/score-codec"
import { cn } from "@/lib/utils"
import { actionErrorMessage } from "./action-error"
import { EntryFilterBar, useEntryFilter, type GridEntry } from "./entry-filter"
import { LocalTime } from "./local-time"
import { OptionSelect } from "./selects"
import { TeamSwatch } from "./team-swatch"

export interface ScoreGridWorkout extends ScoreWorkout {
  id: string
  name: string
  slug: string
  hasTiebreak: boolean
}

export interface ScoreGridScaling {
  id: string
  name: string
}

export interface ScoreGridScore {
  entryId: string
  scalingId: string
  value: number
  capped: boolean
  tiebreakMs: number | null
  /** Display name of whoever last entered it. */
  enteredBy: string | null
  updatedAt: Date
}

interface ScoreGridProps {
  eventId: string
  workouts: ScoreGridWorkout[]
  /** The selected workout (from `?workout=`); null when the event has none. */
  selectedWorkoutId: string | null
  /** Best (lowest rank) first; the first is the default for new scores. */
  scalings: ScoreGridScaling[]
  entries: GridEntry[]
  /** Scores for the selected workout. */
  scores: ScoreGridScore[]
  weightUnit: string
  /** Whether the viewer may enter scores for the selected workout (decided server-side). */
  canEdit: boolean
}

const INPUT_HINT: Record<string, string> = {
  [OPEN_SCORE_TYPE.TIME]: "12:34",
  [OPEN_SCORE_TYPE.REPS]: "245",
  [OPEN_SCORE_TYPE.ROUNDS_REPS]: "8+12",
  [OPEN_SCORE_TYPE.LOAD]: "135",
  [OPEN_SCORE_TYPE.POINTS]: "42",
}

/**
 * Score entry for one workout: a row per athlete with the score (previewed with the codec as you
 * type; the server re-parses and is the authority), capped toggle for capped time workouts,
 * scaling, and tiebreak. Enter saves the row and moves to the next athlete.
 */
export function ScoreGrid({ eventId, workouts, selectedWorkoutId, scalings, entries, scores, weightUnit, canEdit }: ScoreGridProps) {
  const [, setWorkoutParam] = useQueryState("workout", parseAsString.withOptions({ shallow: false }))
  const filter = useEntryFilter(entries)
  const workout = workouts.find((item) => item.id === selectedWorkoutId) ?? null
  const scoreByEntry = new Map(scores.map((score) => [score.entryId, score]))
  const visibleIds = filter.visible.map((entry) => entry.id)

  if (!workout) {
    return <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No workouts yet.</p>
  }

  const isCappable = workout.scoreType === OPEN_SCORE_TYPE.TIME && !!workout.timeCapSeconds
  const showGroups = filter.groups.length > 1

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Workout" className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {workouts.map((item) => (
          <Button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === workout.id}
            size="sm"
            variant={item.id === workout.id ? "default" : "outline"}
            className="shrink-0"
            onClick={() => void setWorkoutParam(item.slug)}
          >
            {item.name}
          </Button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {labelFor({ labels: SCORE_TYPE_LABEL, value: workout.scoreType })}
        {workout.timeCapSeconds ? ` · ${formatTime(workout.timeCapSeconds * 1000)} cap` : ""}
        {workout.scoreType === OPEN_SCORE_TYPE.ROUNDS_REPS && workout.repsPerRound ? ` · ${workout.repsPerRound} reps per round` : ""}
        {workout.scoreType === OPEN_SCORE_TYPE.LOAD ? ` · ${weightUnit}` : ""}
        {workout.hasTiebreak ? " · tiebreak" : ""}
        {canEdit && isCappable ? " · capped? tick Capped and enter reps" : ""}
      </p>

      <EntryFilterBar filter={filter} />

      {entries.length === 0 ? (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No athletes yet.</p>
      ) : (
        <div className="divide-y rounded-md border">
          {filter.groups.map((group) => (
            <section key={group.key} aria-label={group.team?.name ?? "No team"}>
              {showGroups && (
                <h3 className="flex items-center gap-2 border-b bg-muted/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide">
                  <TeamSwatch color={group.team?.color ?? null} />
                  {group.team?.name ?? "No team"}
                </h3>
              )}
              <ul className="divide-y">
                {group.entries.map((entry) => {
                  const saved = scoreByEntry.get(entry.id) ?? null
                  const nextEntryId = visibleIds[visibleIds.indexOf(entry.id) + 1] ?? null
                  return (
                    <ScoreRow
                      // A new workout or a newly saved score (by anyone) resets the row's draft
                      key={`${workout.id}:${entry.id}:${saved?.updatedAt.getTime() ?? "none"}`}
                      eventId={eventId}
                      entry={entry}
                      workout={workout}
                      scalings={scalings}
                      saved={saved}
                      weightUnit={weightUnit}
                      canEdit={canEdit}
                      isCappable={isCappable}
                      nextEntryId={nextEntryId}
                    />
                  )
                })}
              </ul>
            </section>
          ))}
          {filter.visible.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No athletes match.</p>}
        </div>
      )}
    </div>
  )
}

function inputValue({ saved, workout, weightUnit }: { saved: ScoreGridScore | null; workout: ScoreGridWorkout; weightUnit: string }) {
  if (!saved) return ""
  return saved.capped ? String(saved.value) : formatScore({ score: saved, workout, weightUnit })
}

function ScoreRow({
  eventId,
  entry,
  workout,
  scalings,
  saved,
  weightUnit,
  canEdit,
  isCappable,
  nextEntryId,
}: {
  eventId: string
  entry: GridEntry
  workout: ScoreGridWorkout
  scalings: ScoreGridScaling[]
  saved: ScoreGridScore | null
  weightUnit: string
  canEdit: boolean
  isCappable: boolean
  nextEntryId: string | null
}) {
  const id = useId()
  const initial = {
    input: inputValue({ saved, workout, weightUnit }),
    capped: saved?.capped ?? false,
    scalingId: saved?.scalingId ?? scalings[0]?.id ?? "",
    tiebreak: saved?.tiebreakMs != null ? formatTime(saved.tiebreakMs) : "",
  }
  const [draft, setDraft] = useState(initial)
  const { execute: saveScore, isPending: isSaving } = useServerAction(setScoreAction)
  const { execute: clearScore, isPending: isClearing } = useServerAction(clearScoreAction)

  const isDirty =
    draft.input.trim() !== initial.input ||
    draft.capped !== initial.capped ||
    draft.scalingId !== initial.scalingId ||
    draft.tiebreak.trim() !== initial.tiebreak
  const parsed = draft.input.trim() ? parseScore({ input: draft.input, workout, capped: draft.capped || undefined, weightUnit }) : null
  const tiebreak = workout.hasTiebreak && draft.tiebreak.trim() ? parseTime(draft.tiebreak) : null
  const error = (parsed && !parsed.ok && parsed.error) || (tiebreak && !tiebreak.ok && `Tiebreak: ${tiebreak.error}`) || null
  const canSave = canEdit && isDirty && !!parsed?.ok && !error && !!draft.scalingId && !isSaving
  const scalingName = (scalingId: string) => scalings.find((scaling) => scaling.id === scalingId)?.name ?? "?"

  async function save() {
    if (!canSave) return
    const [, err] = await saveScore({
      eventId,
      entryId: entry.id,
      workoutId: workout.id,
      scalingId: draft.scalingId,
      input: draft.input.trim(),
      capped: draft.capped,
      tiebreak: draft.tiebreak.trim() || null,
    })
    if (err) {
      toast.error(actionErrorMessage({ err, fallback: "Failed to save score" }))
      return
    }
    toast.success(`Saved ${entry.name}`)
    if (nextEntryId) document.querySelector<HTMLInputElement>(`[data-score-input="${nextEntryId}"]`)?.focus()
  }

  async function clear() {
    const [, err] = await clearScore({ eventId, entryId: entry.id, workoutId: workout.id })
    if (err) toast.error(actionErrorMessage({ err, fallback: "Failed to clear score" }))
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return
    event.preventDefault()
    void save()
  }

  const savedSummary = saved ? (
    <span className="text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{formatScore({ score: saved, workout, weightUnit })}</span>
      {` · ${scalingName(saved.scalingId)}`}
      {saved.tiebreakMs != null && ` · TB ${formatTime(saved.tiebreakMs)}`}
      <span className="block">
        {saved.enteredBy ? `by ${saved.enteredBy} · ` : ""}
        <LocalTime value={saved.updatedAt} format="MMM d, h:mm a" />
      </span>
    </span>
  ) : (
    <span className="text-xs text-muted-foreground">No score</span>
  )

  return (
    <li className="flex flex-col gap-2 px-3 py-2 md:flex-row md:items-start md:gap-3">
      <div className="flex min-w-0 items-start justify-between gap-2 md:w-56 md:shrink-0 md:flex-col md:justify-start md:gap-0.5">
        <label htmlFor={`${id}-score`} className="truncate pt-1.5 text-sm font-medium md:pt-0">
          {entry.name}
        </label>
        <div className="text-right md:text-left">{savedSummary}</div>
      </div>

      {canEdit && (
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id={`${id}-score`}
              data-score-input={entry.id}
              inputMode={workout.scoreType === OPEN_SCORE_TYPE.TIME ? "text" : "numeric"}
              autoComplete="off"
              placeholder={draft.capped ? "Reps at cap" : INPUT_HINT[workout.scoreType]}
              aria-invalid={!!error}
              aria-describedby={`${id}-preview`}
              className="h-9 w-32"
              value={draft.input}
              onChange={(event) => setDraft({ ...draft, input: event.target.value })}
              onKeyDown={handleKeyDown}
            />
            {isCappable && (
              <label className="flex h-9 items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={draft.capped}
                  onChange={(event) => setDraft({ ...draft, capped: event.target.checked })}
                />
                Capped
              </label>
            )}
            <OptionSelect
              className="h-9 w-36"
              value={draft.scalingId}
              onValueChange={(scalingId) => setDraft({ ...draft, scalingId })}
              options={scalings.map((scaling) => ({ value: scaling.id, label: scaling.name }))}
            />
            {workout.hasTiebreak && (
              <Input
                aria-label={`Tiebreak for ${entry.name}`}
                placeholder="TB 8:15"
                autoComplete="off"
                className="h-9 w-24"
                value={draft.tiebreak}
                onChange={(event) => setDraft({ ...draft, tiebreak: event.target.value })}
                onKeyDown={handleKeyDown}
              />
            )}
            <Button type="button" size="sm" className="h-9" disabled={!canSave} onClick={() => void save()}>
              <Save className="mr-1.5 h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            {saved && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-9"
                disabled={isClearing}
                aria-label={`Clear ${entry.name}'s score`}
                onClick={() => void clear()}
              >
                <Eraser className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p id={`${id}-preview`} aria-live="polite" className={cn("min-h-4 text-xs", error ? "text-destructive" : "text-muted-foreground")}>
            {error ?? (isDirty && parsed?.ok ? `Will save ${formatScore({ score: parsed, workout, weightUnit })} · ${scalingName(draft.scalingId)}` : "")}
          </p>
        </div>
      )}
    </li>
  )
}
