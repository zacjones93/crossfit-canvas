// Plain module: turns a zsa action error into a message for a toast.
import { toast } from "sonner"

interface ActionErrorLike {
  message?: string
  data?: unknown
  fieldErrors?: Record<string, string[] | undefined>
}

export function actionErrorMessage({ err, fallback }: { err: unknown; fallback: string }): string {
  if (!err || typeof err !== "object") return fallback
  const { message, data, fieldErrors } = err as ActionErrorLike
  const firstFieldError = fieldErrors && Object.values(fieldErrors).flat().find(Boolean)
  return firstFieldError || message || (typeof data === "string" ? data : "") || fallback
}

/** True when the action failed with the given zsa error code. */
export function hasErrorCode({ err, code }: { err: unknown; code: string }): boolean {
  return !!err && typeof err === "object" && (err as { code?: string }).code === code
}

/** Toasts an action outcome; returns true on success (handy as a FormDialog `onSubmit` result). */
export function toastResult({ err, success, fallback }: { err: unknown; success: string; fallback: string }): boolean {
  if (err) {
    toast.error(actionErrorMessage({ err, fallback }))
    return false
  }
  toast.success(success)
  return true
}
