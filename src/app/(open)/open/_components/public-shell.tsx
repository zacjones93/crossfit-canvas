import { Suspense, type ReactNode } from "react"
import type { Route } from "next"
import Link from "next/link"
import { ClipboardPen } from "lucide-react"
import { Footer } from "@/components/landing/footer"
import NavFooterLayout from "@/layouts/NavFooterLayout"
import { OPEN_EVENT_STATUS } from "@/lib/open/constants"
import { EVENT_STATUS_LABEL, labelFor } from "@/lib/open/labels"
import { teamPhotoUrl } from "@/lib/open/team-photo"
import { cn } from "@/lib/utils"
import { loadManageLink } from "../_lib/load-manage-link"
import { openThemeClass } from "../_lib/theme"
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

  const bannerUrl = teamPhotoUrl(event.bannerKey)
  // The banner artwork carries the event title; subpages still name themselves
  const isTitleInBanner = Boolean(bannerUrl) && !title

  return (
    <NavFooterLayout>
      {isPreview && <DraftBanner />}
      <div className={cn("flex flex-col", openThemeClass(event.theme))}>
        <header className="bg-black text-white">
          {bannerUrl && <EventBanner url={bannerUrl} name={event.name} isCompact={Boolean(title)} />}
          <div className={cn("container mx-auto px-4", bannerUrl ? "pt-5 md:pt-6" : "pt-8 md:pt-12")}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-widest text-white/60">
              {title ? (
                <Link href={base as Route} className="hover:text-white">
                  {event.name}
                </Link>
              ) : (
                !bannerUrl && <span>CrossFit Canvas Open {event.year}</span>
              )}
              <StatusPill status={event.status} />
              <Suspense fallback={null}>
                <ManageEntry event={event} />
              </Suspense>
            </div>
            <h1
              className={cn(
                "mt-2 font-open-display text-5xl uppercase leading-none tracking-wide text-balance md:text-7xl",
                isTitleInBanner && "sr-only",
              )}
            >
              {title ?? event.name}
            </h1>
            {!isTitleInBanner && <div className="mt-3 h-[3px] w-24 bg-open-accent" aria-hidden />}
            <nav aria-label="Open sections" className="-mb-px mt-6 flex gap-6 overflow-x-auto">
              {tabs.map((tab) => (
                <Link
                  key={tab.section}
                  href={tab.href as Route}
                  aria-current={tab.section === active ? "page" : undefined}
                  className={cn(
                    "whitespace-nowrap border-b-[3px] pb-3 text-sm font-bold uppercase tracking-wider transition-colors",
                    tab.section === active
                      ? "border-open-accent text-white"
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
      </div>
      <Footer />
    </NavFooterLayout>
  )
}

/**
 * The event's banner artwork, centered on black (artwork edges are expected to be dark). Full on the
 * leaderboard; on subpages, a strip from the top of the art (where titles sit) that keeps its proportions.
 */
function EventBanner({ url, name, isCompact }: { url: string; name: string; isCompact: boolean }) {
  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {/* eslint-disable-next-line @next/next/no-img-element -- R2 media, immutable; no image-optimization binding */}
      <img
        src={url}
        alt={isCompact ? "" : `${name} banner`}
        width={1200}
        height={576}
        fetchPriority="high"
        decoding="async"
        className={cn("block h-auto w-full object-cover", isCompact ? "aspect-[29/5] object-top" : "aspect-[25/12]")}
      />
    </div>
  )
}

/** Coach workspace entry: a button for viewers who can manage a team here, otherwise a quiet sign-in link. */
async function ManageEntry({ event }: { event: PublicEvent }) {
  const link = await loadManageLink(event)
  return link.canManage ? (
    <Link
      href={link.href as Route}
      className="ml-auto inline-flex items-center gap-1.5 rounded-sm bg-open-accent px-3 py-1.5 text-xs font-bold tracking-wider text-open-accent-foreground transition-colors hover:bg-open-accent/90"
    >
      <ClipboardPen className="h-3.5 w-3.5" aria-hidden />
      {link.label}
    </Link>
  ) : (
    <Link href={link.href as Route} className="ml-auto normal-case tracking-normal text-white/60 underline-offset-4 hover:text-white hover:underline">
      {link.label}
    </Link>
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
        isLive ? "bg-open-accent text-open-accent-foreground" : "bg-white/15 text-white/80",
      )}
    >
      {isLive && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current motion-reduce:animate-none" aria-hidden />}
      {labelFor({ labels: EVENT_STATUS_LABEL, value: status })}
    </span>
  )
}

/** Section heading used on every public page. */
export function SectionHeading({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <h2 className="font-open-heading text-3xl uppercase tracking-wide md:text-4xl">{children}</h2>
      {aside}
    </div>
  )
}

/** Muted callout for empty states and "hidden" notes. */
export function Note({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">{children}</p>
}
