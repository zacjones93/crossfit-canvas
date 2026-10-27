"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ImagePlus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useServerAction } from "zsa-react"
import { removeTeamPhotoAction } from "@/actions/open/team-profile.action"
import { Button } from "@/components/ui/button"
import { TEAM_PHOTO_MAX_BYTES, TEAM_PHOTO_TYPES } from "@/lib/open/team-photo"
import { toastResult } from "@/components/open/action-error"

const ACCEPT = Object.keys(TEAM_PHOTO_TYPES).join(",")
const UPLOAD_URL = "/api/open/team-photo"

interface UploadErrorBody {
  error?: { message?: string }
}

/** Upload (multipart POST to the team-photo route) or remove a team's photo. */
export function TeamPhotoControl({ eventId, teamId, hasPhoto }: { eventId: string; teamId: string; hasPhoto: boolean }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { execute: removePhoto, isPending: isRemoving } = useServerAction(removeTeamPhotoAction)

  async function upload(file: File) {
    // Same limit the server enforces; saves uploading a file that will be refused
    if (file.size > TEAM_PHOTO_MAX_BYTES) {
      toast.error("Photos must be 5 MB or smaller")
      return
    }
    const body = new FormData()
    body.set("eventId", eventId)
    body.set("teamId", teamId)
    body.set("file", file)

    setIsUploading(true)
    try {
      const response = await fetch(UPLOAD_URL, { method: "POST", body })
      if (!response.ok) {
        const json = (await response.json().catch(() => null)) as UploadErrorBody | null
        toast.error(json?.error?.message ?? "Failed to upload photo")
        return
      }
      toast.success("Photo uploaded")
      // Route handlers can't refresh the client router the way server actions do
      router.refresh()
    } catch {
      toast.error("Failed to upload photo")
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  async function handleRemove() {
    const [, err] = await removePhoto({ eventId, teamId })
    toastResult({ err, success: "Photo removed", fallback: "Failed to remove photo" })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void upload(file)
        }}
      />
      <Button type="button" variant="outline" size="sm" disabled={isUploading} onClick={() => inputRef.current?.click()}>
        <ImagePlus className="mr-2 h-4 w-4" />
        {isUploading ? "Uploading..." : hasPhoto ? "Replace photo" : "Upload photo"}
      </Button>
      {hasPhoto && (
        <Button type="button" variant="ghost" size="sm" disabled={isRemoving || isUploading} onClick={handleRemove}>
          <Trash2 className="mr-2 h-4 w-4" />
          {isRemoving ? "Removing..." : "Remove photo"}
        </Button>
      )}
      <span className="text-xs text-muted-foreground">JPEG, PNG, or WebP · max 5 MB</span>
    </div>
  )
}
