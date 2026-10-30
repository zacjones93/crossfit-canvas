"use client"

import { Pencil, Plus, Trash2 } from "lucide-react"
import { useServerAction } from "zsa-react"
import { deleteOpenScalingAction } from "@/actions/open/scalings.action"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { OpenScaling } from "@/db/schema"
import { isPlacementEnabled, placementSummary } from "@/lib/open/placement"
import { toastResult } from "@/components/open/action-error"
import { ConfirmButton } from "@/components/open/confirm-dialog"
import { ScalingFormDialog } from "./scaling-form-dialog"

/** Scaling levels in rank order (lower = better; also the leaderboard grouping order). */
export function ScalingsTable({ eventId, scalings }: { eventId: string; scalings: OpenScaling[] }) {
  const nextRank = scalings.length > 0 ? Math.max(...scalings.map((scaling) => scaling.rank)) + 1 : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">Scores rank by scaling first (lower rank wins), then by result.</p>
        <ScalingFormDialog
          eventId={eventId}
          nextRank={nextRank}
          trigger={
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Add scaling
            </Button>
          }
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Slug</TableHead>
              <TableHead className="hidden md:table-cell">Placement points</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {scalings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No scaling levels yet.
                </TableCell>
              </TableRow>
            ) : (
              scalings.map((scaling) => <ScalingRow key={scaling.id} eventId={eventId} scaling={scaling} nextRank={nextRank} />)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function ScalingRow({ eventId, scaling, nextRank }: { eventId: string; scaling: OpenScaling; nextRank: number }) {
  const { execute: deleteScaling } = useServerAction(deleteOpenScalingAction)

  async function handleDelete() {
    const [, err] = await deleteScaling({ scalingId: scaling.id })
    return toastResult({ err, success: `Deleted ${scaling.name}`, fallback: "Failed to delete scaling" })
  }

  return (
    <TableRow>
      <TableCell className="tabular-nums">{scaling.rank}</TableCell>
      <TableCell className="font-medium">{scaling.name}</TableCell>
      <TableCell className="hidden text-muted-foreground sm:table-cell">{scaling.slug}</TableCell>
      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
        {isPlacementEnabled(scaling) ? placementSummary(scaling) : "--"}
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <ScalingFormDialog
            eventId={eventId}
            scaling={scaling}
            nextRank={nextRank}
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Edit ${scaling.name}`}>
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <ConfirmButton
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Delete ${scaling.name}`}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
            title="Delete scaling"
            description={
              <p>
                Delete <strong>{scaling.name}</strong>? Scalings used by scores can&apos;t be deleted.
              </p>
            }
            onConfirm={handleDelete}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}
