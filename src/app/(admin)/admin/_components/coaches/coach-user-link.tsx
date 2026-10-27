"use client"

import { useEffect, useRef, useState } from "react"
import { Link2, Unlink } from "lucide-react"
import { toast } from "sonner"
import { useServerAction } from "zsa-react"
import { linkCoachUserAction, searchOpenUsersAction } from "@/actions/open/coach-link.action"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export interface CoachLinkedUser {
  id: string
  email: string | null
  firstName: string | null
  lastName: string | null
}

const SEARCH_DEBOUNCE_MS = 250

function userLabel(user: CoachLinkedUser): string {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || user.id
}

interface CoachUserLinkProps {
  coachId: string
  coachName: string
  user: CoachLinkedUser | null
  /** Called after a successful link/unlink (the table refetches). */
  onChange: () => void
}

/** Shows a coach's linked login and a dialog to search users and (un)link one. */
export function CoachUserLink({ coachId, coachName, user, onChange }: CoachUserLinkProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  // Results belong to `resultsFor`; while it differs from the current query we're searching
  const [results, setResults] = useState<CoachLinkedUser[]>([])
  const [resultsFor, setResultsFor] = useState("")
  const [searchError, setSearchError] = useState<string | null>(null)
  const latestQuery = useRef("")
  const { execute: search } = useServerAction(searchOpenUsersAction)
  const { execute: link, isPending: isLinking } = useServerAction(linkCoachUserAction)
  const trimmedQuery = query.trim()
  const isSearching = !!trimmedQuery && resultsFor !== trimmedQuery && !searchError

  useEffect(() => {
    latestQuery.current = trimmedQuery
    setSearchError(null)
    if (!open || !trimmedQuery) return
    const timer = setTimeout(async () => {
      const [data, err] = await search({ query: trimmedQuery })
      // A newer keystroke superseded this request: drop its (stale) response
      if (latestQuery.current !== trimmedQuery) return
      if (err) setSearchError(err.message || "Search failed")
      else {
        setResults(data ?? [])
        setResultsFor(trimmedQuery)
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [open, trimmedQuery, search])

  async function setLink(userId: string | null) {
    const [, err] = await link({ coachId, userId })
    if (err) {
      toast.error(err.message || "Failed to update the coach's login")
      return
    }
    toast.success(userId ? `Linked ${coachName}` : `Unlinked ${coachName}`)
    setOpen(false)
    onChange()
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setQuery("")
      setResults([])
      setResultsFor("")
    }
  }

  return (
    <div className="flex items-center gap-1">
      {user ? (
        <span className="max-w-40 truncate text-sm" title={user.email ?? undefined}>
          {userLabel(user)}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">--</span>
      )}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Link a login to ${coachName}`}>
            <Link2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Linked user for {coachName}</DialogTitle>
            <DialogDescription>
              A linked login lets the coach use the Open coach workspace for teams they&apos;re assigned to.
            </DialogDescription>
          </DialogHeader>
          {user && (
            <div className="flex items-center justify-between gap-2 rounded-md border p-3 text-sm">
              <div className="min-w-0">
                <div className="truncate font-medium">{userLabel(user)}</div>
                {user.email && <div className="truncate text-xs text-muted-foreground">{user.email}</div>}
              </div>
              <Button variant="outline" size="sm" disabled={isLinking} onClick={() => setLink(null)}>
                <Unlink className="mr-2 h-4 w-4" />
                Unlink
              </Button>
            </div>
          )}
          <Input
            type="search"
            autoFocus
            placeholder="Search users by name or email..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="max-h-64 overflow-y-auto">
            {!trimmedQuery ? (
              <p className="text-sm text-muted-foreground">Type to search.</p>
            ) : searchError ? (
              <p className="text-sm text-destructive">{searchError}</p>
            ) : isSearching ? (
              <p className="text-sm text-muted-foreground">Searching...</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users found.</p>
            ) : (
              <ul className="grid gap-1">
                {results.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      disabled={isLinking || result.id === user?.id}
                      onClick={() => setLink(result.id)}
                      className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent disabled:opacity-50"
                    >
                      <div className="font-medium">{userLabel(result)}</div>
                      {result.email && <div className="text-xs text-muted-foreground">{result.email}</div>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
