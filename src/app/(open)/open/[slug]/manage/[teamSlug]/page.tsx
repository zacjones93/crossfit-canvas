import type { Route } from "next"
import { redirect } from "next/navigation"

export default async function ManageTeamPage({ params }: { params: Promise<{ slug: string; teamSlug: string }> }) {
  const { slug, teamSlug } = await params
  redirect(`/open/${slug}/manage/${teamSlug}/points` as Route)
}
