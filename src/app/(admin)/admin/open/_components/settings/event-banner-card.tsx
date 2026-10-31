"use client"

import { useServerAction } from "zsa-react"
import { removeEventBannerAction } from "@/actions/open/event-banner.action"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { OpenEvent } from "@/db/schema"
import { toastResult } from "@/components/open/action-error"
import { ImageUploadControl } from "@/components/open/image-upload-control"
import { teamPhotoUrl } from "@/lib/open/team-photo"

/** The banner shown across the top of the event's public pages (wide artwork, ~2:1). */
export function EventBannerCard({ event }: { event: OpenEvent }) {
  const { execute, isPending } = useServerAction(removeEventBannerAction)
  const bannerUrl = teamPhotoUrl(event.bannerKey)

  async function handleRemove() {
    const [, err] = await execute({ eventId: event.id })
    toastResult({ err, success: "Banner removed", fallback: "Failed to remove banner" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banner</CardTitle>
        <CardDescription>Wide artwork across the top of the public pages, in place of the plain title. About 2:1 works best.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bannerUrl} alt="Current banner" className="w-full rounded-md border object-cover" />
        )}
        <ImageUploadControl
          uploadUrl="/api/open/event-banner"
          fields={{ eventId: event.id }}
          hasImage={Boolean(bannerUrl)}
          noun="banner"
          onRemove={handleRemove}
          isRemoving={isPending}
        />
      </CardContent>
    </Card>
  )
}
