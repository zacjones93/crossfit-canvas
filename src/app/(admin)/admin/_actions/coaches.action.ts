"use server"

import { createServerAction } from "zsa"
import { getDB } from "@/db"
import { requireAdmin } from "@/utils/auth"
import { z } from "zod"
import { eq, sql, like, or } from "drizzle-orm"
import { coachTable, coachFeedbackTable } from "@/db/schema"
import { PAGE_SIZE_OPTIONS } from "../admin-constants"
import { toSlug } from "@/utils/slug"

const getCoachesSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(Math.max(...PAGE_SIZE_OPTIONS)).default(PAGE_SIZE_OPTIONS[0]),
  filter: z.string().optional(),
})

export const getCoachesAction = createServerAction()
  .input(getCoachesSchema)
  .handler(async ({ input }) => {
    await requireAdmin()

    const db = getDB()
    const { page, pageSize, filter } = input
    const offset = (page - 1) * pageSize

    const whereClause = filter
      ? or(
          like(coachTable.name, `%${filter}%`),
          like(coachTable.slug, `%${filter}%`),
        )
      : undefined

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(coachTable)
      .where(whereClause)

    const coaches = await db.query.coachTable.findMany({
      columns: {
        id: true,
        name: true,
        slug: true,
        credentials: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
      where: whereClause,
      orderBy: (coaches, { desc }) => [desc(coaches.createdAt)],
      limit: pageSize,
      offset,
    })

    return {
      coaches,
      totalCount: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    }
  })

const createCoachSchema = z.object({
  name: z.string().min(1).max(255),
  credentials: z.string().max(255).optional(),
  bio: z.string().optional(),
})

export const createCoachAction = createServerAction()
  .input(createCoachSchema)
  .handler(async ({ input }) => {
    await requireAdmin()

    const db = getDB()
    const slug = toSlug(input.name)

    // Check uniqueness by slug
    const existing = await db.query.coachTable.findFirst({
      where: eq(coachTable.slug, slug),
    })

    if (existing) {
      throw new Error(`A coach with a similar name already exists (slug: ${slug})`)
    }

    const [coach] = await db
      .insert(coachTable)
      .values({
        name: input.name,
        slug,
        credentials: input.credentials ?? null,
        bio: input.bio ?? null,
      })
      .returning()

    return coach
  })

const updateCoachSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(255).optional(),
  credentials: z.string().max(255).optional(),
  bio: z.string().optional(),
})

export const updateCoachAction = createServerAction()
  .input(updateCoachSchema)
  .handler(async ({ input }) => {
    await requireAdmin()

    const db = getDB()
    const { id, name, credentials, bio } = input

    const existing = await db.query.coachTable.findFirst({
      where: eq(coachTable.id, id),
    })

    if (!existing) {
      throw new Error("Coach not found")
    }

    const updates: Record<string, unknown> = {}

    if (name !== undefined) {
      const slug = toSlug(name)
      // Check slug uniqueness if name changed
      if (slug !== existing.slug) {
        const slugConflict = await db.query.coachTable.findFirst({
          where: eq(coachTable.slug, slug),
        })
        if (slugConflict) {
          throw new Error(`A coach with a similar name already exists (slug: ${slug})`)
        }
      }
      updates.name = name
      updates.slug = slug
    }

    if (credentials !== undefined) updates.credentials = credentials
    if (bio !== undefined) updates.bio = bio

    if (Object.keys(updates).length === 0) {
      return existing
    }

    const [coach] = await db
      .update(coachTable)
      .set(updates)
      .where(eq(coachTable.id, id))
      .returning()

    return coach
  })

const deleteCoachSchema = z.object({
  id: z.string().min(1),
})

export const deleteCoachAction = createServerAction()
  .input(deleteCoachSchema)
  .handler(async ({ input }) => {
    await requireAdmin()

    const db = getDB()

    // Check for feedback relationships
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(coachFeedbackTable)
      .where(
        or(
          eq(coachFeedbackTable.reviewerCoachId, input.id),
          eq(coachFeedbackTable.reviewedCoachId, input.id),
        ),
      )

    if (count > 0) {
      throw new Error(
        `Cannot delete coach: they have ${count} feedback record(s). Remove associated feedback first.`,
      )
    }

    await db.delete(coachTable).where(eq(coachTable.id, input.id))

    return { success: true }
  })
