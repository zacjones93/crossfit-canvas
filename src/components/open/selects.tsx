"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NONE } from "@/lib/open/form-data"
import {
  EVENT_STATUS_LABEL,
  RULE_CADENCE_LABEL,
  SCORE_TYPE_LABEL,
  WEIGHT_UNIT_LABEL,
} from "@/lib/open/labels"

interface Option {
  value: string
  label: string
}

interface OptionSelectProps {
  id?: string
  name?: string
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

/** Radix Select over a static option list; with `name` it submits with the surrounding form. */
export function OptionSelect({ id, options, placeholder, className, ...props }: OptionSelectProps & { options: Option[] }) {
  return (
    <Select {...props}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function optionsFrom(labels: Record<string, string>): Option[] {
  return Object.entries(labels).map(([value, label]) => ({ value, label }))
}

export function WeightUnitSelect(props: OptionSelectProps) {
  return <OptionSelect {...props} options={optionsFrom(WEIGHT_UNIT_LABEL)} />
}

export function EventStatusSelect(props: OptionSelectProps) {
  return <OptionSelect {...props} options={optionsFrom(EVENT_STATUS_LABEL)} />
}

export function CadenceSelect(props: OptionSelectProps) {
  return <OptionSelect {...props} options={optionsFrom(RULE_CADENCE_LABEL)} />
}

export function ScoreTypeSelect(props: OptionSelectProps) {
  return <OptionSelect {...props} options={optionsFrom(SCORE_TYPE_LABEL)} />
}

/** Team/week picker with a "none" option (submits NONE; read it with `formOptionalId`). */
export function OptionalIdSelect({
  items,
  noneLabel,
  ...props
}: OptionSelectProps & { items: { id: string; label: string }[]; noneLabel: string }) {
  return <OptionSelect {...props} options={[{ value: NONE, label: noneLabel }, ...items.map((item) => ({ value: item.id, label: item.label }))]} />
}
