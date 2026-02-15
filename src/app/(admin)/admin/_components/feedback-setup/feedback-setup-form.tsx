"use client"

import { useEffect, useState, useCallback } from "react"
import { useServerAction } from "zsa-react"
import { toast } from "sonner"
import {
  getFeedbackQuestionsAction,
  createFeedbackQuestionAction,
  updateFeedbackQuestionAction,
  deleteFeedbackQuestionAction,
  reorderFeedbackQuestionsAction,
} from "../../_actions/feedback-setup.action"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react"

interface FeedbackQuestion {
  id: string
  category: string
  label: string
  description: string | null
  placeholder: string | null
  itemCount: number
  sortOrder: number
  isActive: boolean
}

interface QuestionFormState {
  category: string
  label: string
  description: string
  placeholder: string
  itemCount: number
}

const emptyForm: QuestionFormState = {
  category: "",
  label: "",
  description: "",
  placeholder: "",
  itemCount: 3,
}

export function FeedbackSetupForm() {
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<QuestionFormState>(emptyForm)

  const { execute: fetchQuestions, status: fetchStatus } = useServerAction(getFeedbackQuestionsAction, {
    onSuccess: ({ data }) => {
      setQuestions(data as FeedbackQuestion[])
    },
    onError: () => {
      toast.error("Failed to load questions")
    },
  })

  const { execute: createQuestion, status: createStatus } = useServerAction(createFeedbackQuestionAction, {
    onSuccess: () => {
      toast.success("Question created")
      setDialogOpen(false)
      fetchQuestions()
    },
    onError: () => {
      toast.error("Failed to create question")
    },
  })

  const { execute: updateQuestion, status: updateStatus } = useServerAction(updateFeedbackQuestionAction, {
    onSuccess: () => {
      toast.success("Question updated")
      setDialogOpen(false)
      fetchQuestions()
    },
    onError: () => {
      toast.error("Failed to update question")
    },
  })

  const { execute: deleteQuestion } = useServerAction(deleteFeedbackQuestionAction, {
    onSuccess: () => {
      toast.success("Question deleted")
      fetchQuestions()
    },
    onError: () => {
      toast.error("Failed to delete question")
    },
  })

  const { execute: reorderQuestions } = useServerAction(reorderFeedbackQuestionsAction, {
    onError: () => {
      toast.error("Failed to reorder")
      fetchQuestions()
    },
  })

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const openCreateDialog = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEditDialog = (q: FeedbackQuestion) => {
    setEditingId(q.id)
    setForm({
      category: q.category,
      label: q.label,
      description: q.description ?? "",
      placeholder: q.placeholder ?? "",
      itemCount: q.itemCount,
    })
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (editingId) {
      updateQuestion({
        id: editingId,
        category: form.category,
        label: form.label,
        description: form.description || undefined,
        placeholder: form.placeholder || undefined,
        itemCount: form.itemCount,
      })
    } else {
      createQuestion({
        category: form.category,
        label: form.label,
        description: form.description || undefined,
        placeholder: form.placeholder || undefined,
        itemCount: form.itemCount,
      })
    }
  }

  const handleToggleActive = (q: FeedbackQuestion) => {
    updateQuestion({ id: q.id, isActive: !q.isActive })
    // Optimistic update
    setQuestions((prev) =>
      prev.map((item) => (item.id === q.id ? { ...item, isActive: !item.isActive } : item))
    )
  }

  const handleMove = useCallback(
    (index: number, direction: "up" | "down") => {
      const newQuestions = [...questions]
      const swapIndex = direction === "up" ? index - 1 : index + 1
      if (swapIndex < 0 || swapIndex >= newQuestions.length) return
      ;[newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]]
      setQuestions(newQuestions)
      reorderQuestions({ orderedIds: newQuestions.map((q) => q.id) })
    },
    [questions, reorderQuestions]
  )

  const isSaving = createStatus === "pending" || updateStatus === "pending"

  return (
    <div className="p-6 w-full max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Feedback Questions</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      {fetchStatus === "pending" || fetchStatus === "idle" ? (
        <div>Loading...</div>
      ) : questions.length === 0 ? (
        <div className="text-muted-foreground">No questions configured yet.</div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, index) => (
            <Card key={q.id} className={!q.isActive ? "opacity-60" : undefined}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{q.label}</span>
                  <Badge variant="secondary">{q.category}</Badge>
                  <span className="text-sm text-muted-foreground">{q.itemCount} items</span>
                </div>
                <div className="flex items-center gap-1">
                  <Switch
                    checked={q.isActive}
                    onCheckedChange={() => handleToggleActive(q)}
                    aria-label="Toggle active"
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleMove(index, "up")} disabled={index === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleMove(index, "down")} disabled={index === questions.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(q)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete question?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete &quot;{q.label}&quot;. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteQuestion({ id: q.id })}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              {q.description && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{q.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Question" : "Add Question"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category Key</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. liked, improvement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Display label for this question"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional instructions shown to coaches"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
                id="placeholder"
                value={form.placeholder}
                onChange={(e) => setForm((f) => ({ ...f, placeholder: e.target.value }))}
                placeholder="Placeholder text for input fields"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemCount">Number of Items</Label>
              <Input
                id="itemCount"
                type="number"
                min={1}
                max={10}
                value={form.itemCount}
                onChange={(e) => setForm((f) => ({ ...f, itemCount: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving || !form.category || !form.label}>
              {isSaving ? "Saving..." : editingId ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
