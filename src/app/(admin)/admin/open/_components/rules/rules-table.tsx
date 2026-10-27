"use client"

import { Pencil, Plus, Trash2 } from "lucide-react"
import { useServerAction } from "zsa-react"
import { deleteOpenRuleAction, updateOpenRuleAction } from "@/actions/open/rules.action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { OpenPointRule } from "@/db/schema"
import { toastResult } from "@/components/open/action-error"
import { ConfirmButton } from "@/components/open/confirm-dialog"
import { labelFor, RULE_CADENCE_LABEL } from "@/lib/open/labels"
import { RuleFormDialog } from "./rule-form-dialog"

export function RulesTable({ eventId, rules }: { eventId: string; rules: OpenPointRule[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Retire rules by deactivating them; only rules without awards can be deleted.
        </p>
        <RuleFormDialog
          eventId={eventId}
          trigger={
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Add rule
            </Button>
          }
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="hidden sm:table-cell">Cadence</TableHead>
              <TableHead className="hidden md:table-cell">Coaches</TableHead>
              <TableHead className="hidden md:table-cell text-right">Order</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No rules yet.
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => <RuleRow key={rule.id} eventId={eventId} rule={rule} />)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function RuleRow({ eventId, rule }: { eventId: string; rule: OpenPointRule }) {
  const { execute: updateRule, isPending: isToggling } = useServerAction(updateOpenRuleAction)
  const { execute: deleteRule } = useServerAction(deleteOpenRuleAction)

  async function handleActiveChange(isActive: boolean) {
    const [, err] = await updateRule({ ruleId: rule.id, isActive })
    toastResult({ err, success: `${rule.name} ${isActive ? "activated" : "deactivated"}`, fallback: "Failed to update rule" })
  }

  async function handleDelete() {
    const [, err] = await deleteRule({ ruleId: rule.id })
    return toastResult({ err, success: `Deleted ${rule.name}`, fallback: "Failed to delete rule" })
  }

  return (
    <TableRow className={rule.isActive ? undefined : "opacity-60"}>
      <TableCell>
        <div className="font-medium">{rule.name}</div>
        {rule.description && <div className="line-clamp-2 text-xs text-muted-foreground">{rule.description}</div>}
        <div className="text-xs text-muted-foreground sm:hidden">{labelFor({ labels: RULE_CADENCE_LABEL, value: rule.cadence })}</div>
      </TableCell>
      <TableCell className="text-right font-semibold tabular-nums">{rule.points}</TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant="outline">{labelFor({ labels: RULE_CADENCE_LABEL, value: rule.cadence })}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {rule.coachAwardable ? "Can award" : <span className="text-muted-foreground">Admin only</span>}
      </TableCell>
      <TableCell className="hidden text-right tabular-nums md:table-cell">{rule.sortOrder}</TableCell>
      <TableCell>
        <Switch checked={rule.isActive} disabled={isToggling} onCheckedChange={handleActiveChange} aria-label={`${rule.name} active`} />
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <RuleFormDialog
            eventId={eventId}
            rule={rule}
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Edit ${rule.name}`}>
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <ConfirmButton
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Delete ${rule.name}`}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
            title="Delete rule"
            description={
              <p>
                Delete <strong>{rule.name}</strong>? Rules that already have awards can&apos;t be deleted; deactivate them instead.
              </p>
            }
            onConfirm={handleDelete}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}
