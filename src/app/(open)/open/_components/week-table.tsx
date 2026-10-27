import type { Route } from "next"
import Link from "next/link"
import type { WeekColumn } from "@/lib/open/public-view"

interface WeekTableTeam {
  id: string
  name: string
  slug: string
  color: string | null
  total: number
  byWeek: Record<string, number>
}

/** Teams × weeks points grid (plus the event-level column when present); scrolls sideways on phones. */
export function WeekTable({ teams, columns, slug }: { teams: WeekTableTeam[]; columns: WeekColumn[]; slug: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-max text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th scope="col" className="sticky left-0 bg-muted px-3 py-2 text-left font-semibold">
              Team
            </th>
            {columns.map((column) => (
              <th key={column.key} scope="col" className="px-3 py-2 text-right font-semibold" title={column.label}>
                <abbr title={column.label} className="no-underline">
                  {column.shortLabel}
                </abbr>
              </th>
            ))}
            <th scope="col" className="px-3 py-2 text-right font-semibold">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id} className="border-t">
              <th scope="row" className="sticky left-0 bg-background px-3 py-2 text-left font-semibold">
                <Link href={`/open/${slug}/teams/${team.slug}` as Route} className="inline-flex items-center gap-2 hover:underline">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: team.color ?? "transparent" }}
                  />
                  {team.name}
                </Link>
              </th>
              {columns.map((column) => {
                const points = team.byWeek[column.key] ?? 0
                return (
                  <td key={column.key} className="px-3 py-2 text-right tabular-nums">
                    {points === 0 ? <span className="text-muted-foreground">–</span> : points}
                  </td>
                )
              })}
              <td className="px-3 py-2 text-right font-bold tabular-nums">{team.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
