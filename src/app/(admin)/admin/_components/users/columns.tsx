"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ShieldCheck, ShieldOff } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type User = {
  id: string
  email: string | null
  name: string | null
  role: string
  status: "active" | "inactive"
  createdAt: Date
}

export function getColumns({ onToggleRole }: { onToggleRole: (user: User) => void }): ColumnDef<User>[] {
  return [
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
          <Badge variant={role === "admin" ? "default" : "secondary"}>
            {role}
          </Badge>
        )
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
        const user = row.original
        const isAdmin = user.role === "admin"

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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.id)}
              >
                Copy user ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.email || "")}
              >
                Copy email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onToggleRole(user)}>
                {isAdmin ? (
                  <>
                    <ShieldOff className="mr-2 h-4 w-4" />
                    Remove Admin
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Make Admin
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
