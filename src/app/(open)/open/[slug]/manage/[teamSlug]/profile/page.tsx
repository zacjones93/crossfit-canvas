import Image from "next/image"
import { Users } from "lucide-react"
import { TeamPhotoControl } from "@/components/open/team-photo-control"
import { TeamProfileForm } from "@/components/open/team-profile-form"
import { TeamSwatch } from "@/components/open/team-swatch"
import { teamPhotoUrl } from "@/lib/open/team-photo"
import { loadWorkspaceTeam } from "../../_lib/load-workspace"

export default async function ManageTeamProfilePage({ params }: { params: Promise<{ slug: string; teamSlug: string }> }) {
  const { slug, teamSlug } = await params
  const workspace = await loadWorkspaceTeam({ slug, teamSlug })
  if (!workspace) return null
  const { event, team } = workspace
  const photoUrl = teamPhotoUrl(team.photoKey)

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted">
          {photoUrl ? (
            <Image src={photoUrl} alt={`${team.name} photo`} fill sizes="96px" className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Users className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <TeamSwatch color={team.color} />
            {team.name}
          </h2>
          <p className="text-sm text-muted-foreground">Shown on the public team page. Ask an admin to change the name or color.</p>
        </div>
      </div>
      <TeamPhotoControl eventId={event.id} teamId={team.id} hasPhoto={!!team.photoKey} />
      <TeamProfileForm eventId={event.id} team={team} />
    </div>
  )
}
