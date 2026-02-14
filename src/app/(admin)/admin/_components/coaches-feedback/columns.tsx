"use client"

import { ColumnDef } from "@tanstack/react-table"
import { formatDistanceToNow, format } from "date-fns"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface FeedbackRow {
  id: string
  reviewerCoachName: string
  reviewedCoachName: string
  createdAt: Date
  liked: string[]
  improvements: string[]
}

export const columns: ColumnDef<FeedbackRow>[] = [
  {
    accessorKey: "reviewerCoachName",
    header: "Reviewer",
  },
  {
    accessorKey: "reviewedCoachName",
    header: "Reviewed Coach",
  },
  {
    accessorKey: "liked",
    header: "Liked",
    cell: ({ row }) => {
      const liked = row.original.liked
      return (
        <ul className="list-disc list-inside space-y-1 text-sm">
          {liked.map((item, i) => (
            <li key={i} className="line-clamp-1">{item}</li>
          ))}
        </ul>
      )
    },
  },
  {
    accessorKey: "improvements",
    header: "Improvements",
    cell: ({ row }) => {
      const improvements = row.original.improvements
      return (
        <ul className="list-disc list-inside space-y-1 text-sm">
          {improvements.map((item, i) => (
            <li key={i} className="line-clamp-1">{item}</li>
          ))}
        </ul>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      const formattedDate = format(new Date(date), "PPpp")
      return (
        <Tooltip>
          <TooltipTrigger>
            {formatDistanceToNow(new Date(date), { addSuffix: true })}
          </TooltipTrigger>
          <TooltipContent>
            <p>{formattedDate}</p>
          </TooltipContent>
        </Tooltip>
      )
    },
  },
]
