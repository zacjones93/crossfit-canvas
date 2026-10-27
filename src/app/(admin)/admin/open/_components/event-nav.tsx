"use client"

import type { Route } from "next"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

// Points and Scores grids arrive with the coach workspace (Stage 5).
const SECTIONS = [
  { segment: "", label: "Overview" },
  { segment: "teams", label: "Teams" },
  { segment: "participants", label: "Participants" },
  { segment: "rules", label: "Rules" },
  { segment: "weeks", label: "Weeks" },
  { segment: "workouts", label: "Workouts" },
  { segment: "scalings", label: "Scalings" },
  { segment: "audit", label: "Audit" },
  { segment: "settings", label: "Settings" },
] as const

export function EventNav({ slug }: { slug: string }) {
  const pathname = usePathname()
  const base = `/admin/open/${slug}`

  return (
    <nav className="-mx-4 overflow-x-auto border-b px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1">
        {SECTIONS.map((section) => {
          const href = section.segment ? `${base}/${section.segment}` : base
          const isActive = section.segment ? pathname.startsWith(href) : pathname === base
          return (
            <li key={section.label}>
              <Link
                href={href as Route}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex h-10 items-center border-b-2 px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {section.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
