import type { ReactNode } from "react"
import type { Route } from "next"
import Link from "next/link"
import { Footer } from "@/components/landing/footer"
import NavFooterLayout from "@/layouts/NavFooterLayout"
import { OPEN_EVENT_STATUS } from "@/lib/open/constants"
import { EVENT_STATUS_LABEL, labelFor } from "@/lib/open/labels"
import { cn } from "@/lib/utils"
import type { PublicEvent } from "../_lib/load-public-event"

export const PUBLIC_SECTION = {
  LEADERBOARD: "leaderboard",
  TEAMS: "teams",
  WORKOUTS: "workouts",
} as const

type PublicSection = (typeof PUBLIC_SECTION)[keyof typeof PUBLIC_SECTION]

interface PublicShellProps {
  event: PublicEvent
  isPreview: boolean
  active?: PublicSection
  /** Replaces the event name as the page heading (the event name becomes the eyebrow). */
  title?: string
  children: ReactNode
}

/** Site chrome + event header + section tabs for every public event page (not TV mode). */
export function PublicShell({ event, isPreview, active, title, children }: PublicShellProps) {
  const base = `/open/${event.slug}`
  const tabs = [
    { section: PUBLIC_SECTION.LEADERBOARD, label: "Leaderboard", href: base },
    { section: PUBLIC_SECTION.TEAMS, label: "Teams", href: `${base}/teams` },
    { section: PUBLIC_SECTION.WORKOUTS, label: "Workouts", href: `${base}/workouts` },
  ]

  return (
    <NavFooterLayout>
      {isPreview && <DraftBanner />}
      <header className="bg-black text-white">
        <div className="container mx-auto px-4 pt-8 md:pt-12">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-widest text-white/60">
            {title ? (
              <Link href={base as Route} className="hover:text-white">
                {event.name}
              </Link>
            ) : (
              <span>CrossFit Canvas Open {event.year}</span>
            )}
            <StatusPill status={event.status} />
          </div>
          <h1 className="mt-2 font-heading text-5xl uppercase leading-none tracking-wide text-balance md:text-7xl">
            {title ?? event.name}
          </h1>
          <div className="mt-3 h-[3px] w-24 bg-crimson" aria-hidden />
          <nav aria-label="Open sections" className="-mb-px mt-6 flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.section}
                href={tab.href as Route}
                aria-current={tab.section === active ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap border-b-[3px] pb-3 text-sm font-bold uppercase tracking-wider transition-colors",
                  tab.section === active
                    ? "border-crimson text-white"
                    : "border-transparent text-white/60 hover:text-white",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="container mx-auto flex flex-col gap-12 px-4 py-8 md:py-12">{children}</div>
      <Footer />
    </NavFooterLayout>
  )
}

function DraftBanner() {
  return (
    <div role="status" className="bg-amber-400 px-4 py-2 text-center text-sm font-semibold text-black">
      Draft preview — only admins can see this page until the event goes live.
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const isLive = status === OPEN_EVENT_STATUS.LIVE
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] tracking-widest",
        isLive ? "bg-crimson text-white" : "bg-white/15 text-white/80",
      )}
    >
      {isLive && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white motion-reduce:animate-none" aria-hidden />}
      {labelFor({ labels: EVENT_STATUS_LABEL, value: status })}
    </span>
  )
}

/** Section heading used on every public page. */
export function SectionHeading({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <h2 className="font-heading text-3xl uppercase tracking-wide md:text-4xl">{children}</h2>
      {aside}
    </div>
  )
}

/** Muted callout for empty states and "hidden" notes. */
export function Note({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">{children}</p>
}
