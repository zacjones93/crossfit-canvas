// Plain module: reading typed values out of uncontrolled admin forms.

/** Trimmed string, or undefined when the field is missing/blank. */
export function formText({ formData, name }: { formData: FormData; name: string }): string | undefined {
  const value = formData.get(name)
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed === "" ? undefined : trimmed
}

/** Integer, or undefined when blank (NaN passes through so zod reports it). */
export function formInt({ formData, name }: { formData: FormData; name: string }): number | undefined {
  const text = formText({ formData, name })
  return text === undefined ? undefined : Number(text)
}

/** Switch/checkbox state (Radix Switch submits "on" when checked). */
export function formBool({ formData, name }: { formData: FormData; name: string }): boolean {
  return formData.get(name) === "on"
}

/** Value used by Selects for "nothing selected" (Radix Select items can't use ""). */
export const NONE = "__none__"

/** Select value, mapping NONE/blank to null. */
export function formOptionalId({ formData, name }: { formData: FormData; name: string }): string | null {
  const text = formText({ formData, name })
  return !text || text === NONE ? null : text
}

/** `<input type="date">` value (local midnight) → Date, or null when blank. */
export function formDate({ formData, name }: { formData: FormData; name: string }): Date | null {
  const text = formText({ formData, name })
  return text ? new Date(`${text}T00:00:00`) : null
}

/** Date → `<input type="date">` value in local time. */
export function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return ""
  const local = new Date(date)
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}`
}
