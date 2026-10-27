import { Badge } from "@/components/ui/badge"
import { OPEN_EVENT_STATUS } from "@/lib/open/constants"
import { cn } from "@/lib/utils"
import { EVENT_STATUS_LABEL, labelFor } from "@/lib/open/labels"

const STATUS_CLASS: Record<string, string> = {
  [OPEN_EVENT_STATUS.DRAFT]: "",
  [OPEN_EVENT_STATUS.LIVE]: "border-transparent bg-emerald-600 text-white hover:bg-emerald-600/80 dark:bg-emerald-500",
  [OPEN_EVENT_STATUS.CLOSED]: "",
}

const STATUS_VARIANT: Record<string, "secondary" | "outline" | "default"> = {
  [OPEN_EVENT_STATUS.DRAFT]: "secondary",
  [OPEN_EVENT_STATUS.LIVE]: "default",
  [OPEN_EVENT_STATUS.CLOSED]: "outline",
}

export function EventStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? "outline"} className={cn(STATUS_CLASS[status], className)}>
      {labelFor({ labels: EVENT_STATUS_LABEL, value: status })}
    </Badge>
  )
}
