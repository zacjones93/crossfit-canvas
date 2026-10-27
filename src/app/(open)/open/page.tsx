import type { Metadata, Route } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Footer } from "@/components/landing/footer"
import NavFooterLayout from "@/layouts/NavFooterLayout"
import { EVENT_STATUS_LABEL, labelFor } from "@/lib/open/labels"
import { getLiveEvent } from "@/server/open/events"
import { getPublicEvents } from "@/server/open/public"

export const metadata: Metadata = {
  title: "The Open",
  description: "CrossFit Canvas intramural Open: team standings, workouts, and results.",
}

/** Redirects to the live event; otherwise lists past (closed) events, newest first. */
export default async function OpenIndexPage() {
  const live = await getLiveEvent()
  if (live) redirect(`/open/${live.slug}` as Route)

  const events = await getPublicEvents()

  return (
    <NavFooterLayout>
      <header className="bg-black text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">CrossFit Canvas</p>
          <h1 className="mt-2 font-heading text-5xl uppercase leading-none tracking-wide md:text-7xl">The Open</h1>
          <div className="mt-3 h-[3px] w-24 bg-crimson" aria-hidden />
        </div>
      </header>
      <div className="container mx-auto px-4 py-10 md:py-14">
        {events.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-8 text-center">
            <h2 className="font-heading text-4xl uppercase">No Open running right now</h2>
            <p className="text-muted-foreground">
              Our intramural Open runs alongside the CrossFit Games Open each year. Check back when it kicks off — teams,
              standings, and workouts will show up here.
            </p>
          </div>
        ) : (
          <section aria-labelledby="past-events" className="mx-auto max-w-2xl">
            <h2 id="past-events" className="font-heading text-3xl uppercase tracking-wide md:text-4xl">
              No Open running right now
            </h2>
            <p className="mb-6 text-muted-foreground">Look back at past results:</p>
            <ul className="flex flex-col gap-3">
              {events.map((event) => (
                <li key={event.slug}>
                  <Link
                    href={`/open/${event.slug}` as Route}
                    className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4 transition-colors hover:border-foreground/40"
                  >
                    <span>
                      <span className="block font-subheading text-lg font-bold">{event.name}</span>
                      <span className="text-sm text-muted-foreground">{event.year}</span>
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {labelFor({ labels: EVENT_STATUS_LABEL, value: event.status })} →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <Footer />
    </NavFooterLayout>
  )
}
