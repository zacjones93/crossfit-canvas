"use client"

import type { Route } from "next"
import Link from "next/link"
import { useParams, usePathname, useRouter } from "next/navigation"
import { OptionSelect } from "@/components/open/selects"
import { cn } from "@/lib/utils"

const SECTIONS = [
  { segment: "points", label: "Points" },
  { segment: "scores", label: "Scores" },
  { segment: "profile", label: "Team profile" },
] as const

interface WorkspaceNavProps {
  slug: string
  teams: { slug: string; name: string }[]
}

/** Team switcher (keeps the current section) + section tabs; hidden on the team picker. */
export function WorkspaceNav({ slug, teams }: WorkspaceNavProps) {
  const { teamSlug } = useParams<{ teamSlug?: string }>()
  const pathname = usePathname()
  const router = useRouter()
  if (!teamSlug) return null

  const base = `/open/${slug}/manage`
  const section = SECTIONS.find((item) => pathname.startsWith(`${base}/${teamSlug}/${item.segment}`))?.segment ?? "points"

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <nav aria-label="Workspace" className="-mx-4 overflow-x-auto border-b px-4 sm:mx-0 sm:px-0">
        <ul className="flex min-w-max gap-1">
          {SECTIONS.map((item) => (
            <li key={item.segment}>
              <Link
                href={`${base}/${teamSlug}/${item.segment}` as Route}
                aria-current={item.segment === section ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex h-10 items-center border-b-2 px-3 text-sm font-medium transition-colors",
                  item.segment === section
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {teams.length > 1 && (
        <OptionSelect
          className="sm:w-56"
          value={teamSlug}
          onValueChange={(value) => router.push(`${base}/${value}/${section}` as Route)}
          options={teams.map((team) => ({ value: team.slug, label: team.name }))}
        />
      )}
    </div>
  )
}
