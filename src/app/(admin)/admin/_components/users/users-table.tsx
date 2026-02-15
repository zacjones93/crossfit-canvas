"use client"

import { useCallback, useEffect, useMemo } from "react"
import { DataTable } from "@/components/data-table"
import { getColumns, type User } from "./columns"
import { getUsersAction } from "../../_actions/get-users.action"
import { updateUserRoleAction } from "../../_actions/update-user-role.action"
import { useServerAction } from "zsa-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { PAGE_SIZE_OPTIONS } from "../../admin-constants"
import { useQueryState } from "nuqs"
import { ROLES_ENUM } from "@/db/schema"

export function UsersTable() {
  const [page, setPage] = useQueryState("page", { defaultValue: "1" })
  const [pageSize, setPageSize] = useQueryState("pageSize", { defaultValue: PAGE_SIZE_OPTIONS[0].toString() })
  const [emailFilter, setEmailFilter] = useQueryState("email", { defaultValue: "" })

  const { execute: fetchUsers, data, error, status } = useServerAction(getUsersAction, {
    onError: () => {
      toast.error("Failed to fetch users")
    },
  })

  const { execute: updateRole } = useServerAction(updateUserRoleAction, {
    onError: (error) => {
      toast.error(error.err?.message || "Failed to update role")
    },
    onSuccess: () => {
      toast.success("Role updated")
      fetchUsers({ page: parseInt(page), pageSize: parseInt(pageSize), emailFilter })
    },
  })

  useEffect(() => {
    fetchUsers({ page: parseInt(page), pageSize: parseInt(pageSize), emailFilter })
  }, [fetchUsers, page, pageSize, emailFilter])

  const handleToggleRole = useCallback((user: User) => {
    const newRole = user.role === ROLES_ENUM.ADMIN ? ROLES_ENUM.USER : ROLES_ENUM.ADMIN
    updateRole({ userId: user.id, role: newRole })
  }, [updateRole])

  const columns = useMemo(() => getColumns({ onToggleRole: handleToggleRole }), [handleToggleRole])

  const handlePageChange = (newPage: number) => {
    setPage((newPage + 1).toString())
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize.toString())
    setPage("1")
  }

  const handleEmailFilterChange = (value: string) => {
    setEmailFilter(value)
    setPage("1")
  }

  const getRowHref = (user: User) => {
    return `/admin/users/${user.id}`
  }

  return (
    <div className="p-6 w-full min-w-0 flex flex-col overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between flex-shrink-0">
        <h1 className="text-3xl font-bold">Users</h1>
        <Input
          placeholder="Filter emails..."
          type="search"
          value={emailFilter}
          onChange={(event) => handleEmailFilterChange(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="mt-8 flex-1 min-h-0">
        <div className="space-y-4 h-full">
          {status === 'pending' || status === 'idle' ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error: Failed to fetch users</div>
          ) : !data ? (
            <div>No users found</div>
          ) : (
            <div className="w-full min-w-0">
              <DataTable
                columns={columns}
                data={data.users}
                pageCount={data.totalPages}
                pageIndex={parseInt(page) - 1}
                pageSize={parseInt(pageSize)}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                totalCount={data.totalCount}
                itemNameSingular="user"
                itemNamePlural="users"
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                getRowHref={getRowHref}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
