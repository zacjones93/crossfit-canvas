"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ImagePlus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { TEAM_PHOTO_MAX_BYTES, TEAM_PHOTO_TYPES } from "@/lib/open/team-photo"

const ACCEPT = Object.keys(TEAM_PHOTO_TYPES).join(",")

interface UploadErrorBody {
  error?: { message?: string }
}

interface ImageUploadControlProps {
  /** Multipart route handler that takes `fields` + `file`. */
  uploadUrl: string
  fields: Record<string, string>
  hasImage: boolean
  /** "photo", "banner", … — used in button labels and toasts. */
  noun: string
  onRemove: () => Promise<unknown>
  isRemoving: boolean
}

/** Upload (multipart POST to an Open image route) or remove an image. */
export function ImageUploadControl({ uploadUrl, fields, hasImage, noun, onRemove, isRemoving }: ImageUploadControlProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  async function upload(file: File) {
    // Same limit the server enforces; saves uploading a file that will be refused
    if (file.size > TEAM_PHOTO_MAX_BYTES) {
      toast.error("Images must be 5 MB or smaller")
      return
    }
    const body = new FormData()
    for (const [name, value] of Object.entries(fields)) body.set(name, value)
    body.set("file", file)

    setIsUploading(true)
    try {
      const response = await fetch(uploadUrl, { method: "POST", body })
      if (!response.ok) {
        const json = (await response.json().catch(() => null)) as UploadErrorBody | null
        toast.error(json?.error?.message ?? `Failed to upload ${noun}`)
        return
      }
      toast.success(`Uploaded ${noun}`)
      // Route handlers can't refresh the client router the way server actions do
      router.refresh()
    } catch {
      toast.error(`Failed to upload ${noun}`)
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
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
        {isUploading ? "Uploading..." : hasImage ? `Replace ${noun}` : `Upload ${noun}`}
      </Button>
      {hasImage && (
        <Button type="button" variant="ghost" size="sm" disabled={isRemoving || isUploading} onClick={() => void onRemove()}>
          <Trash2 className="mr-2 h-4 w-4" />
          {isRemoving ? "Removing..." : `Remove ${noun}`}
        </Button>
      )}
      <span className="text-xs text-muted-foreground">JPEG, PNG, or WebP · max 5 MB</span>
    </div>
  )
}
