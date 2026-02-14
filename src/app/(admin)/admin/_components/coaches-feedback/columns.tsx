"use client"

import { ColumnDef } from "@tanstack/react-table"
import { formatDistanceToNow, format } from "date-fns"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface FeedbackRow {
  id: string
  reviewerCoachName: string
  reviewedCoachName: string
  reviewedCoachSlug: string
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
    cell: ({ row }) => {
      const name = row.original.reviewedCoachName
      const slug = row.original.reviewedCoachSlug
      return (
        <Link
          href={`/admin/coaches-feedback/${slug}`}
          className="text-primary hover:underline font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          {name}
        </Link>
      )
    },
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
