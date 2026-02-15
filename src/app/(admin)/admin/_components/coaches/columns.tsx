"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type Coach = {
  id: string
  name: string
  slug: string
  credentials: string | null
  bio: string | null
  createdAt: Date
  updatedAt: Date | null
}

export function getColumns({ onEdit, onDelete }: { onEdit: (coach: Coach) => void; onDelete: (coach: Coach) => void }): ColumnDef<Coach>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <code className="text-muted-foreground text-xs bg-muted px-1.5 py-0.5 rounded">
          {row.getValue("slug")}
        </code>
      ),
    },
    {
      accessorKey: "credentials",
      header: "Credentials",
      cell: ({ row }) => {
        const val = row.getValue("credentials") as string | null
        return val || <span className="text-muted-foreground">--</span>
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
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
    {
      id: "actions",
      cell: ({ row }) => {
        const coach = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(coach)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(coach)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
