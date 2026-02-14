"use client"

import { useEffect } from "react"
import { DataTable } from "@/components/data-table"
import { columns, type FeedbackRow } from "./columns"
import { getFeedbackAction } from "../../_actions/get-feedback.action"
import { useServerAction } from "zsa-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { PAGE_SIZE_OPTIONS } from "../../admin-constants"
import { useQueryState } from "nuqs"

export function FeedbackTable() {
  const [page, setPage] = useQueryState("page", { defaultValue: "1" })
  const [pageSize, setPageSize] = useQueryState("pageSize", { defaultValue: PAGE_SIZE_OPTIONS[0].toString() })
  const [coachFilter, setCoachFilter] = useQueryState("coach", { defaultValue: "" })

  const { execute: fetchFeedback, data, error, status } = useServerAction(getFeedbackAction, {
    onError: () => {
      toast.error("Failed to fetch feedback")
    },
  })

  useEffect(() => {
    fetchFeedback({ page: parseInt(page), pageSize: parseInt(pageSize), coachFilter })
  }, [fetchFeedback, page, pageSize, coachFilter])

  const handlePageChange = (newPage: number) => {
    setPage((newPage + 1).toString())
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize.toString())
    setPage("1")
  }

  const handleCoachFilterChange = (value: string) => {
    setCoachFilter(value)
    setPage("1")
  }

  return (
    <div className="p-6 w-full min-w-0 flex flex-col overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between flex-shrink-0">
        <h1 className="text-3xl font-bold">Coaches Feedback</h1>
        <Input
          placeholder="Filter by reviewed coach..."
          type="search"
          value={coachFilter}
          onChange={(event) => handleCoachFilterChange(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="mt-8 flex-1 min-h-0">
        <div className="space-y-4 h-full">
          {status === "pending" || status === "idle" ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error: Failed to fetch feedback</div>
          ) : !data ? (
            <div>No feedback found</div>
          ) : (
            <div className="w-full min-w-0">
              <DataTable<FeedbackRow, unknown>
                columns={columns}
                data={data.feedback as FeedbackRow[]}
                pageCount={data.totalPages}
                pageIndex={parseInt(page) - 1}
                pageSize={parseInt(pageSize)}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                totalCount={data.totalCount}
                itemNameSingular="submission"
                itemNamePlural="submissions"
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                getRowHref={(row) => `/admin/coaches-feedback/${row.reviewedCoachSlug}`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
