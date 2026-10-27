import { cn } from "@/lib/utils"
import { initials } from "@/lib/open/public-view"

interface TeamPhotoProps {
  name: string
  color: string | null
  photoUrl: string | null
  /** Intrinsic size (sets the aspect ratio and reserves space → no layout shift); CSS size via className. */
  width: number
  height: number
  className?: string
  /** Empty when the team name is rendered right next to the photo. */
  alt?: string
  loading?: "lazy" | "eager"
  initialsClassName?: string
}

/**
 * A team's uploaded photo, or its color with initials as a fallback. Plain `<img>`: uploads are served
 * from R2 via `/open/media/...` with immutable caching and there's no image-optimization binding.
 */
export function TeamPhoto({
  name,
  color,
  photoUrl,
  width,
  height,
  className,
  alt = "",
  loading = "lazy",
  initialsClassName,
}: TeamPhotoProps) {
  if (photoUrl)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        className={cn("shrink-0 bg-muted object-cover", className)}
      />
    )

  return (
    <div
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn(
        "flex shrink-0 select-none items-center justify-center font-heading tracking-wide",
        color ? "text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.6)]" : "bg-muted text-muted-foreground",
        className,
      )}
      style={{ aspectRatio: `${width} / ${height}`, ...(color ? { backgroundColor: color } : {}) }}
    >
      <span className={initialsClassName}>{initials(name)}</span>
    </div>
  )
}
