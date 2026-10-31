"use client"

import { useServerAction } from "zsa-react"
import { removeTeamPhotoAction } from "@/actions/open/team-profile.action"
import { toastResult } from "@/components/open/action-error"
import { ImageUploadControl } from "@/components/open/image-upload-control"

/** Upload (multipart POST to the team-photo route) or remove a team's photo. */
export function TeamPhotoControl({ eventId, teamId, hasPhoto }: { eventId: string; teamId: string; hasPhoto: boolean }) {
  const { execute: removePhoto, isPending } = useServerAction(removeTeamPhotoAction)

  async function handleRemove() {
    const [, err] = await removePhoto({ eventId, teamId })
    toastResult({ err, success: "Photo removed", fallback: "Failed to remove photo" })
  }

  return (
    <ImageUploadControl
      uploadUrl="/api/open/team-photo"
      fields={{ eventId, teamId }}
      hasImage={hasPhoto}
      noun="photo"
      onRemove={handleRemove}
      isRemoving={isPending}
    />
  )
}
