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
  categories: Record<string, string[]>
}

export function createColumns(questions: { category: string; label: string }[]): ColumnDef<FeedbackRow>[] {
  return [
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
    ...questions.map((q) => ({
      id: q.category,
      header: q.label,
      cell: ({ row }: { row: { original: FeedbackRow } }) => {
        const items = row.original.categories[q.category] ?? []
        return (
          <ul className="list-disc list-inside space-y-1 text-sm">
            {items.map((item: string, i: number) => (
              <li key={i} className="line-clamp-1">{item}</li>
            ))}
          </ul>
        )
      },
    })),
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
}
