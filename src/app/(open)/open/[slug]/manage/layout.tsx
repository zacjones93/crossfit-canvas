import type { ReactNode } from "react"
import type { Route } from "next"
import Link from "next/link"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import NavFooterLayout from "@/layouts/NavFooterLayout"
import { WorkspaceNav } from "./_components/workspace-nav"
import { loadWorkspace } from "./_lib/load-workspace"

export default async function ManageLayout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { event, teams, isAdmin } = await loadWorkspace(slug)

  return (
    <NavFooterLayout>
      <header className="bg-black text-white">
        <div className="container mx-auto flex flex-wrap items-end justify-between gap-2 px-4 py-6 md:py-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Coach workspace</p>
            <h1 className="font-heading text-4xl uppercase tracking-wide md:text-5xl">{event.name}</h1>
          </div>
          {isAdmin && <Badge variant="secondary">Admin</Badge>}
        </div>
      </header>
      <div className="container mx-auto flex flex-col gap-4 px-4 py-6">
        {teams.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-12 text-center">
            <h2 className="font-heading text-3xl uppercase">No teams to manage</h2>
            <p className="text-muted-foreground">
              You&apos;re not a coach for any team in {event.name}. If you think that&apos;s wrong, ask an admin to link your
              account to your coach profile and assign you to a team.
            </p>
            <Button asChild variant="outline">
              <Link href={"/" as Route}>Back to home</Link>
            </Button>
          </div>
        ) : (
          <NuqsAdapter>
            <WorkspaceNav slug={event.slug} teams={teams.map((team) => ({ slug: team.slug, name: team.name }))} />
            {children}
          </NuqsAdapter>
        )}
      </div>
    </NavFooterLayout>
  )
}
