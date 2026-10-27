"use client"

import type { ReactNode } from "react"
import { useServerAction } from "zsa-react"
import { createOpenRuleAction, updateOpenRuleAction } from "@/actions/open/rules.action"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { OpenPointRule } from "@/db/schema"
import { OPEN_RULE_CADENCE } from "@/lib/open/constants"
import { toastResult } from "@/components/open/action-error"
import { Field, SwitchField } from "@/components/open/field"
import { FormDialog } from "@/components/open/form-dialog"
import { formBool, formInt, formText } from "@/lib/open/form-data"
import { CadenceSelect } from "@/components/open/selects"

interface RuleFormDialogProps {
  eventId: string
  /** Edit this rule; omit to create. */
  rule?: OpenPointRule
  trigger: ReactNode
}

export function RuleFormDialog({ eventId, rule, trigger }: RuleFormDialogProps) {
  const { execute: createRule } = useServerAction(createOpenRuleAction)
  const { execute: updateRule } = useServerAction(updateOpenRuleAction)

  async function handleSubmit(formData: FormData) {
    const fields = {
      name: formText({ formData, name: "name" }) ?? "",
      description: formText({ formData, name: "description" }) ?? null,
      points: formInt({ formData, name: "points" }) ?? 0,
      cadence: formText({ formData, name: "cadence" }) ?? OPEN_RULE_CADENCE.PER_WEEK,
      coachAwardable: formBool({ formData, name: "coachAwardable" }),
      sortOrder: formInt({ formData, name: "sortOrder" }),
      isActive: formBool({ formData, name: "isActive" }),
    }
    const [, err] = rule ? await updateRule({ ruleId: rule.id, ...fields }) : await createRule({ eventId, ...fields })
    return toastResult({ err, success: rule ? "Rule updated" : "Rule created", fallback: "Failed to save rule" })
  }

  return (
    <FormDialog trigger={trigger} title={rule ? `Edit ${rule.name}` : "Add point rule"} submitLabel={rule ? "Save changes" : "Create rule"} onSubmit={handleSubmit}>
      <Field id="rule-name" label="Name *">
        <Input id="rule-name" name="name" required defaultValue={rule?.name} placeholder="Costume" />
      </Field>
      <Field id="rule-description" label="Description">
        <Textarea id="rule-description" name="description" rows={2} defaultValue={rule?.description ?? ""} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field id="rule-points" label="Points *" hint="Snapshotted onto each award; changing it doesn't touch past awards.">
          <Input id="rule-points" name="points" type="number" required min={-1000} max={1000} defaultValue={rule?.points ?? 1} />
        </Field>
        <Field id="rule-sort-order" label="Sort order">
          <Input id="rule-sort-order" name="sortOrder" type="number" defaultValue={rule?.sortOrder ?? 0} />
        </Field>
      </div>
      <Field id="rule-cadence" label="Cadence" hint="Can't change once the rule has awards.">
        <CadenceSelect id="rule-cadence" name="cadence" defaultValue={rule?.cadence ?? OPEN_RULE_CADENCE.PER_WEEK} />
      </Field>
      <SwitchField id="rule-coach-awardable" label="Coaches can award" hint="Admins can always award.">
        <Switch id="rule-coach-awardable" name="coachAwardable" defaultChecked={rule?.coachAwardable ?? true} />
      </SwitchField>
      <SwitchField id="rule-active" label="Active" hint="Inactive rules keep their awards but can't be awarded by coaches.">
        <Switch id="rule-active" name="isActive" defaultChecked={rule?.isActive ?? true} />
      </SwitchField>
    </FormDialog>
  )
}
