# Coaches Feedback System - Implementation Plan

## Overview
Build a coaches peer feedback system with two parts:
1. **Public feedback form** at `/coaches/feedback` where coaches select a peer and submit structured feedback (3 likes + 3 improvements)
2. **Admin dashboard page** at `/admin/coaches-feedback` to view all submitted feedback in a TanStack table

---

## Step 1: Extract coaches data to a shared constant

**Why**: The coaches array is currently hardcoded in `src/app/(marketing)/about/page.tsx`. Both the about page and the new feedback form need this data, so extract it to a shared file.

**Files**:
- Create `src/constants/coaches.ts` — export the coaches array and TypeScript interface
- Update `src/app/(marketing)/about/page.tsx` — import coaches from the new shared file

**Coach interface**:
```typescript
interface Coach {
  name: string
  credentials: string
  image: string
  bio: string
}
```

---

## Step 2: Add `coach_feedback` and `feedback_item` tables to the database schema

**File**: `src/db/schema.ts`

**Design rationale**: Instead of hardcoding columns like `liked1`, `liked2`, `liked3`, we use a normalized two-table model. The `coach_feedback` table is the submission envelope, and `feedback_item` stores individual pieces of feedback. This means:
- The number of feedback items per category is not locked to 3
- New categories (beyond "liked" and "improvement") can be added without schema changes
- Questions/prompts can evolve over time
- If we later want admin-configurable question templates, we just add a `feedback_question` table and FK the items to it

**Table definitions**:
```
coach_feedback (submission envelope):
  - id (text, PK, auto-generated with "cfb_" prefix)
  - reviewerCoachName (text, required) — the coach giving the feedback
  - reviewedCoachName (text, required) — the coach being reviewed
  - commonColumns (createdAt, updatedAt, updateCounter)

feedback_item (individual feedback entries):
  - id (text, PK, auto-generated with "fbi_" prefix)
  - feedbackId (text, required, FK → coach_feedback.id)
  - category (text, required) — e.g. "liked", "improvement" (extensible to future types)
  - content (text, required) — the actual feedback text
  - sortOrder (integer, required) — ordering within the category (0, 1, 2, ...)
  - commonColumns (createdAt, updatedAt, updateCounter)
```

**Relations** (Drizzle `relations()`):
- `coach_feedback` → has many `feedback_item`
- `feedback_item` → belongs to one `coach_feedback`

**Indexes**:
- `coach_feedback`: reviewerCoachName, reviewedCoachName, createdAt
- `feedback_item`: feedbackId, category

Then run `pnpm db:generate add_coach_feedback` to generate the migration.

---

## Step 3: Create the feedback form page at `/coaches/feedback`

**Route group**: `(marketing)` — public page, no login required (coaches may not have accounts)

**Files to create**:
- `src/app/(marketing)/coaches/feedback/page.tsx` — server component page wrapper with metadata
- `src/app/(marketing)/coaches/feedback/feedback-form.tsx` — client component form
- `src/app/(marketing)/coaches/feedback/feedback.action.ts` — server action to save feedback

**Form fields**:
- "Your Name" — dropdown select from coaches list
- "Coach Being Reviewed" — dropdown select from coaches list (filtered to exclude the reviewer)
- "3 Things You Liked" — three separate textarea fields (rendered dynamically, count driven by a constant)
- "3 Things That Could Be Improved" — three separate textarea fields (rendered dynamically, count driven by a constant)
- Submit button

**Form pattern**: React Hook Form + Zod + ZSA (consistent with existing forms in the codebase)

**Validation** (Zod schema):
- All fields required, text fields min 1 char
- Reviewer and reviewed coach cannot be the same person
- Items validated as arrays of `{ category, content }` objects

**Server action**:
- Insert one row into `coach_feedback`, then insert N rows into `feedback_item` (one per response)
- Note: D1 doesn't support transactions, so inserts happen sequentially
- Rate limit to prevent spam
- Return success/error with toast notification

---

## Step 4: Add admin "Coaches Feedback" page

**Files to create**:
- `src/app/(admin)/admin/coaches-feedback/page.tsx` — server component page
- `src/app/(admin)/admin/_components/coaches-feedback/feedback-table.tsx` — client TanStack table component
- `src/app/(admin)/admin/_components/coaches-feedback/columns.tsx` — column definitions
- `src/app/(admin)/admin/_actions/get-feedback.action.ts` — server action to fetch feedback (paginated)

**Table columns**: Reviewer, Reviewed Coach, Date, and expandable row or detail view for the actual feedback content (liked items and improvement items grouped by category)

**Server action**: Query `coach_feedback` joined with `feedback_item` — group feedback items by their parent submission and nest them in the response.

**Pattern**: Follow the existing users table pattern exactly — NUQS for pagination state, `useServerAction` for data fetching, reuse the generic `DataTable` component.

---

## Step 5: Add sidebar navigation item for admin

**File**: `src/app/(admin)/admin/_components/admin-sidebar.tsx`

Add a "Coaches Feedback" item to `adminNavItems` with the `MessageSquare` icon from Lucide, linking to `/admin/coaches-feedback`.

---

## File Change Summary

**New files (7)**:
1. `src/constants/coaches.ts`
2. `src/app/(marketing)/coaches/feedback/page.tsx`
3. `src/app/(marketing)/coaches/feedback/feedback-form.tsx`
4. `src/app/(marketing)/coaches/feedback/feedback.action.ts`
5. `src/app/(admin)/admin/coaches-feedback/page.tsx`
6. `src/app/(admin)/admin/_components/coaches-feedback/feedback-table.tsx`
7. `src/app/(admin)/admin/_components/coaches-feedback/columns.tsx`
8. `src/app/(admin)/admin/_actions/get-feedback.action.ts`

**Modified files (3)**:
1. `src/app/(marketing)/about/page.tsx` — import coaches from shared constant
2. `src/db/schema.ts` — add coach_feedback + feedback_item tables and relations
3. `src/app/(admin)/admin/_components/admin-sidebar.tsx` — add nav item
