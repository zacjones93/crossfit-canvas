import type { Metadata } from "next"
import type { Route } from "next"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getEventCounts, getEvents } from "@/server/open/events"
import { CreateEventDialog } from "./_components/create-event-dialog"
import { EventStatusBadge } from "./_components/event-status-badge"

export const metadata: Metadata = {
  title: "Open Events - Admin",
  description: "Manage CrossFit Open intramural events",
}

export default async function OpenEventsPage() {
  const [events, counts] = await Promise.all([getEvents(), getEventCounts()])

  return (
    <>
      <PageHeader items={[{ href: "/admin", label: "Admin" }, { href: "/admin/open", label: "Open" }]} />
      <div className="flex w-full min-w-0 flex-col gap-6 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Open events</h1>
            <p className="text-sm text-muted-foreground">Teams, point rules, workouts, and standings for each Open.</p>
          </div>
          <CreateEventDialog />
        </div>

        {events.length === 0 ? (
          <div className="rounded-md border border-dashed p-10 text-center text-muted-foreground">
            No events yet. Create one to get started.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Teams</TableHead>
                  <TableHead className="text-right">Athletes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const eventCounts = counts.get(event.id)
                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Link href={`/admin/open/${event.slug}` as Route} className="font-medium hover:underline">
                          {event.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">/open/{event.slug}</div>
                      </TableCell>
                      <TableCell>{event.year}</TableCell>
                      <TableCell>
                        <EventStatusBadge status={event.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{eventCounts?.teams ?? 0}</TableCell>
                      <TableCell className="text-right tabular-nums">{eventCounts?.entries ?? 0}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  )
}
