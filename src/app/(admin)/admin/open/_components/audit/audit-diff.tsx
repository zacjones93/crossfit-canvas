import { OPEN_AUDIT_VERB } from "@/lib/open/constants"
import { cn } from "@/lib/utils"

function parseSnapshot(json: string | null): Record<string, unknown> | null {
  if (!json) return null
  try {
    const value: unknown = JSON.parse(json)
    return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null
  } catch {
    return null
  }
}

function show(value: unknown): string {
  if (value === undefined) return ""
  if (value === null) return "null"
  return typeof value === "string" ? value : JSON.stringify(value)
}

/**
 * Key-level diff of an audit row's before/after JSON: updates show only changed keys; creates and
 * deletes show the whole snapshot.
 */
export function AuditDiff({ action, before, after }: { action: string; before: string | null; after: string | null }) {
  const beforeSnapshot = parseSnapshot(before)
  const afterSnapshot = parseSnapshot(after)
  const keys = [...new Set([...Object.keys(beforeSnapshot ?? {}), ...Object.keys(afterSnapshot ?? {})])]
  const rows = keys
    .map((key) => ({ key, before: show(beforeSnapshot?.[key]), after: show(afterSnapshot?.[key]) }))
    .filter((row) => action !== OPEN_AUDIT_VERB.UPDATE || row.before !== row.after)

  if (rows.length === 0) return <p className="text-xs text-muted-foreground">No snapshot recorded.</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="py-1 pr-4 font-medium">Field</th>
            {beforeSnapshot && <th className="py-1 pr-4 font-medium">Before</th>}
            {afterSnapshot && <th className="py-1 font-medium">After</th>}
          </tr>
        </thead>
        <tbody className="font-mono">
          {rows.map((row) => {
            const changed = row.before !== row.after
            return (
              <tr key={row.key} className="border-t align-top">
                <td className="py-1 pr-4 font-sans font-medium">{row.key}</td>
                {beforeSnapshot && (
                  <td className={cn("break-all py-1 pr-4", changed && afterSnapshot && "text-red-600 line-through dark:text-red-400")}>
                    {row.before}
                  </td>
                )}
                {afterSnapshot && (
                  <td className={cn("break-all py-1", changed && beforeSnapshot && "text-emerald-700 dark:text-emerald-400")}>{row.after}</td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
