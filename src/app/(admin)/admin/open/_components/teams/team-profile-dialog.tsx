"use client"

import { useState, type ReactNode } from "react"
import { TeamPhotoControl } from "@/components/open/team-photo-control"
import { TeamProfileForm } from "@/components/open/team-profile-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { AdminOpenTeam } from "./types"

/** Admin wrapper around the shared team profile editor (photo, motto, description). */
export function TeamProfileDialog({ eventId, team, trigger }: { eventId: string; team: AdminOpenTeam; trigger: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{team.name} profile</DialogTitle>
          <DialogDescription>Shown on the public team page. The team&apos;s coaches can edit it too.</DialogDescription>
        </DialogHeader>
        <TeamPhotoControl eventId={eventId} teamId={team.id} hasPhoto={!!team.photoKey} />
        <TeamProfileForm eventId={eventId} team={team} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
