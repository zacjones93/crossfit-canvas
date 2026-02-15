"use client"

import { LogOut } from "lucide-react"
import { useSessionStore } from "@/state/session"
import useSignOut from "@/hooks/useSignOut"
import { Button } from "@/components/ui/button"

export function FooterLogoutButton() {
  const session = useSessionStore((s) => s.session)
  const { signOut } = useSignOut()

  if (!session?.user) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={signOut}
      className="text-sm text-muted-foreground hover:text-foreground gap-2"
    >
      <LogOut className="h-4 w-4" />
      Log out
    </Button>
  )
}
