import type { Route } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getWeeks, getWorkouts } from "@/server/open/event-data"
import { getEventCounts } from "@/server/open/events"
import { getStandings } from "@/server/open/standings"
import { TeamSwatch } from "@/components/open/team-swatch"
import { loadAdminEvent } from "../_lib/load-event"

const AVG_FORMAT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 })

export default async function OpenEventOverviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await loadAdminEvent(slug)
  const [standings, counts, weeks, workouts] = await Promise.all([
    getStandings({ eventId: event.id }),
    getEventCounts({ eventId: event.id }),
    getWeeks({ eventId: event.id }),
    getWorkouts({ eventId: event.id }),
  ])
  const eventCounts = counts.get(event.id) ?? { teams: 0, entries: 0 }
  const assigned = standings.teams.reduce((sum, team) => sum + team.memberCount, 0)
  const base = `/admin/open/${event.slug}`

  const stats = [
    { label: "Teams", value: eventCounts.teams, href: `${base}/teams` },
    { label: "Athletes", value: eventCounts.entries, href: `${base}/participants` },
    { label: "Without a team", value: eventCounts.entries - assigned, href: `${base}/participants` },
    { label: "Weeks", value: weeks.length, href: `${base}/weeks` },
    { label: "Workouts", value: workouts.length, href: `${base}/workouts` },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href as Route} className="rounded-lg border p-4 transition-colors hover:bg-accent">
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Standings</CardTitle>
        </CardHeader>
        <CardContent>
          {standings.teams.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No teams yet. <Link href={`${base}/teams` as Route} className="underline">Add teams</Link> to see standings.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-right">Members</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Avg / member</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.teams.map((team, index) => (
                  <TableRow key={team.id}>
                    <TableCell className="tabular-nums text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2 font-medium">
                        <TeamSwatch color={team.color} />
                        {team.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{team.memberCount}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{team.total}</TableCell>
                    <TableCell className="text-right tabular-nums">{AVG_FORMAT.format(team.avgPerMember)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {standings.unassigned !== 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              {standings.unassigned} point(s) belong to athletes without a team and aren&apos;t counted above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
