"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Pencil, EyeOff, Eye, StickyNote, Undo2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useServerAction } from "zsa-react"
import { useRouter } from "next/navigation"
import { saveAnnotationAction, deleteAnnotationAction } from "../../_actions/feedback-annotations.action"

interface FeedbackItemAnnotationProps {
  feedbackItemId: string
  originalContent: string
  revisedContent: string | null
  excluded: boolean
  adminNote: string | null
  hasAnnotation: boolean
  showCurated: boolean
}

export function FeedbackItemAnnotation({
  feedbackItemId,
  originalContent,
  revisedContent,
  excluded,
  adminNote,
  hasAnnotation,
  showCurated,
}: FeedbackItemAnnotationProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(revisedContent ?? originalContent)
  const [editNote, setEditNote] = useState(adminNote ?? "")
  const [showNote, setShowNote] = useState(false)

  const { execute: save, status: saveStatus } = useServerAction(saveAnnotationAction, {
    onSuccess: () => {
      toast.success("Annotation saved")
      setEditing(false)
      setShowNote(false)
      router.refresh()
    },
    onError: () => toast.error("Failed to save annotation"),
  })

  const { execute: remove, status: removeStatus } = useServerAction(deleteAnnotationAction, {
    onSuccess: () => {
      toast.success("Reverted to original")
      setEditing(false)
      setEditValue(originalContent)
      setEditNote("")
      router.refresh()
    },
    onError: () => toast.error("Failed to revert"),
  })

  const isSaving = saveStatus === "pending"
  const isRemoving = removeStatus === "pending"

  // In curated view, hide excluded items
  if (showCurated && excluded) return null

  const displayContent = showCurated
    ? (revisedContent ?? originalContent)
    : originalContent

  function handleSaveEdit() {
    const contentChanged = editValue !== originalContent
    save({
      feedbackItemId,
      revisedContent: contentChanged ? editValue : null,
      excluded,
      adminNote: editNote || null,
    })
  }

  function handleToggleExclude() {
    save({
      feedbackItemId,
      revisedContent: revisedContent,
      excluded: !excluded,
      adminNote: adminNote,
    })
  }

  return (
    <li
      className={cn(
        "text-sm flex gap-2 group relative rounded-md py-1 px-1 -mx-1 transition-colors",
        excluded && "opacity-50 line-through",
        hasAnnotation && revisedContent && !excluded && "bg-amber-50 dark:bg-amber-950/20",
      )}
    >
      <span className="shrink-0 mt-0.5">&bull;</span>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground mb-1">
              Original: <span className="italic">{originalContent}</span>
            </div>
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="min-h-[60px] text-sm"
              placeholder="Reworded content for sharing..."
            />
            {showNote && (
              <Textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                className="min-h-[40px] text-xs"
                placeholder="Internal admin note (not shared)..."
              />
            )}
            <div className="flex gap-1.5">
              <Button size="sm" variant="default" onClick={handleSaveEdit} disabled={isSaving}>
                <Check className="h-3 w-3 mr-1" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              {!showNote && (
                <Button size="sm" variant="ghost" onClick={() => setShowNote(true)}>
                  <StickyNote className="h-3 w-3 mr-1" />
                  Note
                </Button>
              )}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">
            {displayContent}
            {!showCurated && hasAnnotation && revisedContent && (
              <span className="ml-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                (edited)
              </span>
            )}
          </span>
        )}
      </div>

      {/* Action buttons - visible on hover */}
      {!editing && !showCurated && (
        <div className="flex items-start gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit for sharing</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={handleToggleExclude}
                >
                  {excluded ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{excluded ? "Include in summary" : "Exclude from summary"}</TooltipContent>
            </Tooltip>

            {hasAnnotation && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => remove({ feedbackItemId })}
                    disabled={isRemoving}
                  >
                    <Undo2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Revert to original</TooltipContent>
              </Tooltip>
            )}

            {adminNote && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center justify-center h-6 w-6">
                    <StickyNote className="h-3 w-3 text-amber-500" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">{adminNote}</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      )}
    </li>
  )
}
