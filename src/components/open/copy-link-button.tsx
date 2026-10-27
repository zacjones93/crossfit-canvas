"use client"

import { Check, Link as LinkIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface CopyLinkButtonProps {
  /** Site-relative path, e.g. `/open/open-2026`. Resolved against the current origin. */
  path: string
  label: string
}

export function CopyLinkButton({ path, label }: CopyLinkButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  function handleCopy() {
    const url = new URL(path, window.location.origin).toString()
    navigator.clipboard.writeText(url).then(
      () => {
        toast.success("Link copied", { description: url })
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      },
      () => toast.error("Failed to copy link"),
    )
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      {isCopied ? <Check className="size-4" /> : <LinkIcon className="size-4" />}
      {label}
    </Button>
  )
}
