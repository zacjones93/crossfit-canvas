"use client"

import { useEffect, useMemo, useState } from "react"
import { DataTable } from "@/components/data-table"
import { getColumns, type Coach } from "./columns"
import {
  getCoachesAction,
  createCoachAction,
  updateCoachAction,
  deleteCoachAction,
} from "../../_actions/coaches.action"
import { useServerAction } from "zsa-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PAGE_SIZE_OPTIONS } from "../../admin-constants"
import { useQueryState } from "nuqs"
import { Plus } from "lucide-react"

export function CoachesTable() {
  const [page, setPage] = useQueryState("page", { defaultValue: "1" })
  const [pageSize, setPageSize] = useQueryState("pageSize", { defaultValue: PAGE_SIZE_OPTIONS[0].toString() })
  const [nameFilter, setNameFilter] = useQueryState("name", { defaultValue: "" })

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null)
  const [deleteCoach, setDeleteCoach] = useState<Coach | null>(null)

  // Form state
  const [formName, setFormName] = useState("")
  const [formCredentials, setFormCredentials] = useState("")
  const [formBio, setFormBio] = useState("")

  const { execute: fetchCoaches, data, error, status } = useServerAction(getCoachesAction, {
    onError: () => {
      toast.error("Failed to fetch coaches")
    },
  })

  const { execute: createCoach, status: createStatus } = useServerAction(createCoachAction, {
    onError: (error) => {
      toast.error(error.err?.message || "Failed to create coach")
    },
    onSuccess: () => {
      toast.success("Coach created")
      setDialogOpen(false)
      resetForm()
      fetchCoaches({ page: parseInt(page), pageSize: parseInt(pageSize), filter: nameFilter || undefined })
    },
  })

  const { execute: updateCoach, status: updateStatus } = useServerAction(updateCoachAction, {
    onError: (error) => {
      toast.error(error.err?.message || "Failed to update coach")
    },
    onSuccess: () => {
      toast.success("Coach updated")
      setDialogOpen(false)
      setEditingCoach(null)
      resetForm()
      fetchCoaches({ page: parseInt(page), pageSize: parseInt(pageSize), filter: nameFilter || undefined })
    },
  })

  const { execute: executeDelete, status: deleteStatus } = useServerAction(deleteCoachAction, {
    onError: (error) => {
      toast.error(error.err?.message || "Failed to delete coach")
    },
    onSuccess: () => {
      toast.success("Coach deleted")
      setDeleteCoach(null)
      fetchCoaches({ page: parseInt(page), pageSize: parseInt(pageSize), filter: nameFilter || undefined })
    },
  })

  useEffect(() => {
    fetchCoaches({ page: parseInt(page), pageSize: parseInt(pageSize), filter: nameFilter || undefined })
  }, [fetchCoaches, page, pageSize, nameFilter])

  function resetForm() {
    setFormName("")
    setFormCredentials("")
    setFormBio("")
  }

  function handleOpenCreate() {
    setEditingCoach(null)
    resetForm()
    setDialogOpen(true)
  }

  function handleEdit(coach: Coach) {
    setEditingCoach(coach)
    setFormName(coach.name)
    setFormCredentials(coach.credentials || "")
    setFormBio(coach.bio || "")
    setDialogOpen(true)
  }

  function handleDelete(coach: Coach) {
    setDeleteCoach(coach)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingCoach) {
      updateCoach({
        id: editingCoach.id,
        name: formName,
        credentials: formCredentials || undefined,
        bio: formBio || undefined,
      })
    } else {
      createCoach({
        name: formName,
        credentials: formCredentials || undefined,
        bio: formBio || undefined,
      })
    }
  }

  function handleConfirmDelete() {
    if (deleteCoach) {
      executeDelete({ id: deleteCoach.id })
    }
  }

  const columns = useMemo(() => getColumns({ onEdit: handleEdit, onDelete: handleDelete }), [])

  const handlePageChange = (newPage: number) => {
    setPage((newPage + 1).toString())
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize.toString())
    setPage("1")
  }

  const handleNameFilterChange = (value: string) => {
    setNameFilter(value)
    setPage("1")
  }

  const isMutating = createStatus === "pending" || updateStatus === "pending"

  return (
    <div className="p-6 w-full min-w-0 flex flex-col overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between flex-shrink-0">
        <h1 className="text-3xl font-bold">Coaches</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter by name..."
            type="search"
            value={nameFilter}
            onChange={(event) => handleNameFilterChange(event.target.value)}
            className="max-w-sm"
          />
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Coach
          </Button>
        </div>
      </div>
      <div className="mt-8 flex-1 min-h-0">
        <div className="space-y-4 h-full">
          {status === "pending" || status === "idle" ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error: Failed to fetch coaches</div>
          ) : !data ? (
            <div>No coaches found</div>
          ) : (
            <div className="w-full min-w-0">
              <DataTable
                columns={columns}
                data={data.coaches}
                pageCount={data.totalPages}
                pageIndex={parseInt(page) - 1}
                pageSize={parseInt(pageSize)}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                totalCount={data.totalCount}
                itemNameSingular="coach"
                itemNamePlural="coaches"
                pageSizeOptions={PAGE_SIZE_OPTIONS}
              />
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingCoach(null); resetForm() } else { setDialogOpen(true) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCoach ? "Edit Coach" : "Add Coach"}</DialogTitle>
            <DialogDescription>
              {editingCoach ? "Update the coach details below." : "Fill in the details to add a new coach."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Coach name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="credentials">Credentials</Label>
                <Input
                  id="credentials"
                  value={formCredentials}
                  onChange={(e) => setFormCredentials(e.target.value)}
                  placeholder="e.g. CF-L3, USAW"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Short bio..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setEditingCoach(null); resetForm() }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating || !formName.trim()}>
                {isMutating ? "Saving..." : editingCoach ? "Save Changes" : "Create Coach"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteCoach} onOpenChange={(open) => { if (!open) setDeleteCoach(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coach</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteCoach?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteStatus === "pending"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteStatus === "pending" ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
