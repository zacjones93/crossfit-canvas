"use client"

import { useEffect, useMemo } from "react"
import { DataTable } from "@/components/data-table"
import { columns, type FeedbackRow } from "./columns"
import { getFeedbackAction } from "../../_actions/get-feedback.action"
import { useServerAction } from "zsa-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PAGE_SIZE_OPTIONS } from "../../admin-constants"
import { useQueryState } from "nuqs"
import { format, subMonths } from "date-fns"
import { fromZonedTime } from "date-fns-tz"

// Gym timezone — anchors monthly review cycles so boundaries
// are consistent regardless of where the admin browses from.
const GYM_TIMEZONE = "America/Denver"

function getMonthOptions() {
  const options = []
  const now = new Date()
  // Show current month + 11 previous months
  for (let i = 0; i < 12; i++) {
    const date = subMonths(now, i)
    options.push({
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy"),
    })
  }
  return options
}

/** Convert a yyyy-MM month key into UTC start/end boundaries in the gym's timezone */
function getMonthRangeInTimezone(monthKey: string) {
  const [year, m] = monthKey.split("-").map(Number)
  // Start: 1st of month at 00:00:00 in gym timezone → UTC
  const startLocal = new Date(year, m - 1, 1, 0, 0, 0, 0)
  // End: last moment of month in gym timezone → UTC
  // Get last day by going to next month day 0
  const lastDay = new Date(year, m, 0).getDate()
  const endLocal = new Date(year, m - 1, lastDay, 23, 59, 59, 999)
  return {
    from: fromZonedTime(startLocal, GYM_TIMEZONE).toISOString(),
    to: fromZonedTime(endLocal, GYM_TIMEZONE).toISOString(),
  }
}

export function FeedbackTable() {
  const [page, setPage] = useQueryState("page", { defaultValue: "1" })
  const [pageSize, setPageSize] = useQueryState("pageSize", { defaultValue: PAGE_SIZE_OPTIONS[0].toString() })
  const [coachFilter, setCoachFilter] = useQueryState("coach", { defaultValue: "" })
  const [month, setMonth] = useQueryState("month", { defaultValue: format(new Date(), "yyyy-MM") })

  const monthOptions = useMemo(() => getMonthOptions(), [])

  const dateRange = useMemo(() => getMonthRangeInTimezone(month), [month])

  const { execute: fetchFeedback, data, error, status } = useServerAction(getFeedbackAction, {
    onError: () => {
      toast.error("Failed to fetch feedback")
    },
  })

  useEffect(() => {
    fetchFeedback({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      coachFilter,
      from: dateRange.from,
      to: dateRange.to,
    })
  }, [fetchFeedback, page, pageSize, coachFilter, dateRange])

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

  const handleMonthChange = (value: string) => {
    setMonth(value)
    setPage("1")
  }

  return (
    <div className="p-6 w-full min-w-0 flex flex-col overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between flex-shrink-0">
        <h1 className="text-3xl font-bold">Coaches Feedback</h1>
        <div className="flex items-center gap-2">
          <Select value={month} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Filter by coach..."
            type="search"
            value={coachFilter}
            onChange={(event) => handleCoachFilterChange(event.target.value)}
            className="max-w-sm"
          />
        </div>
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
