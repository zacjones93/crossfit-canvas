import { sqliteTable, integer, text, index, uniqueIndex, check } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { type InferSelectModel } from "drizzle-orm";

import { createId } from '@paralleldrive/cuid2'

import {
  OPEN_EVENT_STATUS,
  OPEN_RULE_CADENCE,
  OPEN_WEIGHT_UNIT,
  openAuditEntityTuple,
  openAuditVerbTuple,
  openEventStatusTuple,
  openRuleCadenceTuple,
  openScoreTypeTuple,
  openWeightUnitTuple,
} from "../lib/open/constants";

export const ROLES_ENUM = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

const roleTuple = Object.values(ROLES_ENUM) as [string, ...string[]];

const commonColumns = {
  createdAt: integer({
    mode: "timestamp",
  }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer({
    mode: "timestamp",
  }).$onUpdateFn(() => new Date()).notNull(),
  updateCounter: integer().default(0).$onUpdate(() => sql`updateCounter + 1`),
}

export const userTable = sqliteTable("user", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `usr_${createId()}`).notNull(),
  firstName: text({
    length: 255,
  }),
  lastName: text({
    length: 255,
  }),
  email: text({
    length: 255,
  }).unique(),
  passwordHash: text(),
  role: text({
    enum: roleTuple,
  }).default(ROLES_ENUM.USER).notNull(),
  emailVerified: integer({
    mode: "timestamp",
  }),
  signUpIpAddress: text({
    length: 100,
  }),
  googleAccountId: text({
    length: 255,
  }),
  /**
   * This can either be an absolute or relative path to an image
   */
  avatar: text({
    length: 600,
  }),
  // Credit system fields
  currentCredits: integer().default(0).notNull(),
  lastCreditRefreshAt: integer({
    mode: "timestamp",
  }),
}, (table) => ([
  index('email_idx').on(table.email),
  index('google_account_id_idx').on(table.googleAccountId),
  index('role_idx').on(table.role),
]));

export const passKeyCredentialTable = sqliteTable("passkey_credential", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `pkey_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),
  credentialId: text({
    length: 255,
  }).notNull().unique(),
  credentialPublicKey: text({
    length: 255,
  }).notNull(),
  counter: integer().notNull(),
  // Optional array of AuthenticatorTransport as JSON string
  transports: text({
    length: 255,
  }),
  // Authenticator Attestation GUID. We use this to identify the device/authenticator app that created the passkey
  aaguid: text({
    length: 255,
  }),
  // The user agent of the device that created the passkey
  userAgent: text({
    length: 255,
  }),
  // The IP address that created the passkey
  ipAddress: text({
    length: 100,
  }),
}, (table) => ([
  index('user_id_idx').on(table.userId),
  index('credential_id_idx').on(table.credentialId),
]));

// Credit transaction types
export const CREDIT_TRANSACTION_TYPE = {
  PURCHASE: 'PURCHASE',
  USAGE: 'USAGE',
  MONTHLY_REFRESH: 'MONTHLY_REFRESH',
} as const;

export const creditTransactionTypeTuple = Object.values(CREDIT_TRANSACTION_TYPE) as [string, ...string[]];

export const creditTransactionTable = sqliteTable("credit_transaction", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `ctxn_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),
  amount: integer().notNull(),
  // Track how many credits are still available from this transaction
  remainingAmount: integer().default(0).notNull(),
  type: text({
    enum: creditTransactionTypeTuple,
  }).notNull(),
  description: text({
    length: 255,
  }).notNull(),
  expirationDate: integer({
    mode: "timestamp",
  }),
  expirationDateProcessedAt: integer({
    mode: "timestamp",
  }),
  paymentIntentId: text({
    length: 255,
  }),
}, (table) => ([
  index('credit_transaction_user_id_idx').on(table.userId),
  index('credit_transaction_type_idx').on(table.type),
  index('credit_transaction_created_at_idx').on(table.createdAt),
  index('credit_transaction_expiration_date_idx').on(table.expirationDate),
  index('credit_transaction_payment_intent_id_idx').on(table.paymentIntentId),
]));

// Define item types that can be purchased
export const PURCHASABLE_ITEM_TYPE = {
  COMPONENT: 'COMPONENT',
  // Add more types in the future (e.g., TEMPLATE, PLUGIN, etc.)
} as const;

export const purchasableItemTypeTuple = Object.values(PURCHASABLE_ITEM_TYPE) as [string, ...string[]];

export const purchasedItemsTable = sqliteTable("purchased_item", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `pitem_${createId()}`).notNull(),
  userId: text().notNull().references(() => userTable.id),
  // The type of item (e.g., COMPONENT, TEMPLATE, etc.)
  itemType: text({
    enum: purchasableItemTypeTuple,
  }).notNull(),
  // The ID of the item within its type (e.g., componentId)
  itemId: text().notNull(),
  purchasedAt: integer({
    mode: "timestamp",
  }).$defaultFn(() => new Date()).notNull(),
}, (table) => ([
  index('purchased_item_user_id_idx').on(table.userId),
  index('purchased_item_type_idx').on(table.itemType),
  // Composite index for checking if a user owns a specific item of a specific type
  index('purchased_item_user_item_idx').on(table.userId, table.itemType, table.itemId),
]));

// System-defined roles - these are always available
export const SYSTEM_ROLES_ENUM = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  GUEST: 'guest',
} as const;

export const systemRoleTuple = Object.values(SYSTEM_ROLES_ENUM) as [string, ...string[]];

// Define available permissions
export const TEAM_PERMISSIONS = {
  // Resource access
  ACCESS_DASHBOARD: 'access_dashboard',
  ACCESS_BILLING: 'access_billing',

  // User management
  INVITE_MEMBERS: 'invite_members',
  REMOVE_MEMBERS: 'remove_members',
  CHANGE_MEMBER_ROLES: 'change_member_roles',

  // Team management
  EDIT_TEAM_SETTINGS: 'edit_team_settings',
  DELETE_TEAM: 'delete_team',

  // Role management
  CREATE_ROLES: 'create_roles',
  EDIT_ROLES: 'edit_roles',
  DELETE_ROLES: 'delete_roles',
  ASSIGN_ROLES: 'assign_roles',

  // Content permissions
  CREATE_COMPONENTS: 'create_components',
  EDIT_COMPONENTS: 'edit_components',
  DELETE_COMPONENTS: 'delete_components',

  // Add more as needed
} as const;

// Team table
export const teamTable = sqliteTable("team", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `team_${createId()}`).notNull(),
  name: text({ length: 255 }).notNull(),
  slug: text({ length: 255 }).notNull().unique(),
  description: text({ length: 1000 }),
  avatarUrl: text({ length: 600 }),
  // Settings could be stored as JSON
  settings: text({ length: 10000 }),
  // Optional billing-related fields
  billingEmail: text({ length: 255 }),
  planId: text({ length: 100 }),
  planExpiresAt: integer({ mode: "timestamp" }),
  creditBalance: integer().default(0).notNull(),
}, (table) => ([
  index('team_slug_idx').on(table.slug),
]));

// Team membership table
export const teamMembershipTable = sqliteTable("team_membership", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `tmem_${createId()}`).notNull(),
  teamId: text().notNull().references(() => teamTable.id),
  userId: text().notNull().references(() => userTable.id),
  // This can be either a system role or a custom role ID
  roleId: text().notNull(),
  // Flag to indicate if this is a system role
  isSystemRole: integer().default(1).notNull(),
  invitedBy: text().references(() => userTable.id),
  invitedAt: integer({ mode: "timestamp" }),
  joinedAt: integer({ mode: "timestamp" }),
  expiresAt: integer({ mode: "timestamp" }),
  isActive: integer().default(1).notNull(),
}, (table) => ([
  index('team_membership_team_id_idx').on(table.teamId),
  index('team_membership_user_id_idx').on(table.userId),
  // Instead of unique() which causes linter errors, we'll create a unique constraint on columns
  index('team_membership_unique_idx').on(table.teamId, table.userId),
]));

// Team role table
export const teamRoleTable = sqliteTable("team_role", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `trole_${createId()}`).notNull(),
  teamId: text().notNull().references(() => teamTable.id),
  name: text({ length: 255 }).notNull(),
  description: text({ length: 1000 }),
  // Store permissions as a JSON array of permission keys
  permissions: text({ mode: 'json' }).notNull().$type<string[]>(),
  // A JSON field for storing UI-specific settings like color, icon, etc.
  metadata: text({ length: 5000 }),
  // Optional flag to mark some roles as non-editable
  isEditable: integer().default(1).notNull(),
}, (table) => ([
  index('team_role_team_id_idx').on(table.teamId),
  // Instead of unique() which causes linter errors, we'll create a unique constraint on columns
  index('team_role_name_unique_idx').on(table.teamId, table.name),
]));

// Team invitation table
export const teamInvitationTable = sqliteTable("team_invitation", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `tinv_${createId()}`).notNull(),
  teamId: text().notNull().references(() => teamTable.id),
  email: text({ length: 255 }).notNull(),
  // This can be either a system role or a custom role ID
  roleId: text().notNull(),
  // Flag to indicate if this is a system role
  isSystemRole: integer().default(1).notNull(),
  token: text({ length: 255 }).notNull().unique(),
  invitedBy: text().notNull().references(() => userTable.id),
  expiresAt: integer({ mode: "timestamp" }).notNull(),
  acceptedAt: integer({ mode: "timestamp" }),
  acceptedBy: text().references(() => userTable.id),
}, (table) => ([
  index('team_invitation_team_id_idx').on(table.teamId),
  index('team_invitation_email_idx').on(table.email),
  index('team_invitation_token_idx').on(table.token),
]));

export const teamRelations = relations(teamTable, ({ many }) => ({
  memberships: many(teamMembershipTable),
  invitations: many(teamInvitationTable),
  roles: many(teamRoleTable),
}));

export const teamRoleRelations = relations(teamRoleTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [teamRoleTable.teamId],
    references: [teamTable.id],
  }),
}));

export const teamMembershipRelations = relations(teamMembershipTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [teamMembershipTable.teamId],
    references: [teamTable.id],
  }),
  user: one(userTable, {
    fields: [teamMembershipTable.userId],
    references: [userTable.id],
  }),
  invitedByUser: one(userTable, {
    fields: [teamMembershipTable.invitedBy],
    references: [userTable.id],
  }),
}));

export const teamInvitationRelations = relations(teamInvitationTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [teamInvitationTable.teamId],
    references: [teamTable.id],
  }),
  invitedByUser: one(userTable, {
    fields: [teamInvitationTable.invitedBy],
    references: [userTable.id],
  }),
  acceptedByUser: one(userTable, {
    fields: [teamInvitationTable.acceptedBy],
    references: [userTable.id],
  }),
}));

export const creditTransactionRelations = relations(creditTransactionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [creditTransactionTable.userId],
    references: [userTable.id],
  }),
}));

export const purchasedItemsRelations = relations(purchasedItemsTable, ({ one }) => ({
  user: one(userTable, {
    fields: [purchasedItemsTable.userId],
    references: [userTable.id],
  }),
}));

export const userRelations = relations(userTable, ({ many }) => ({
  passkeys: many(passKeyCredentialTable),
  creditTransactions: many(creditTransactionTable),
  purchasedItems: many(purchasedItemsTable),
  teamMemberships: many(teamMembershipTable),
}));

export const passKeyCredentialRelations = relations(passKeyCredentialTable, ({ one }) => ({
  user: one(userTable, {
    fields: [passKeyCredentialTable.userId],
    references: [userTable.id],
  }),
}));

// Coach table
export const coachTable = sqliteTable("coach", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `coach_${createId()}`).notNull(),
  name: text({ length: 255 }).notNull(),
  slug: text({ length: 255 }).notNull().unique(),
  credentials: text({ length: 255 }),
  bio: text(),
  // Optional login link (lets a coach act in the Open coach workspace)
  userId: text().references(() => userTable.id, { onDelete: "set null" }).unique(),
}, (table) => ([
  index('coach_slug_idx').on(table.slug),
  index('coach_name_idx').on(table.name),
]));

// Coach feedback tables
export const coachFeedbackTable = sqliteTable("coach_feedback", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `cfb_${createId()}`).notNull(),
  reviewerCoachId: text().notNull().references(() => coachTable.id),
  reviewedCoachId: text().notNull().references(() => coachTable.id),
}, (table) => ([
  index('coach_feedback_reviewer_idx').on(table.reviewerCoachId),
  index('coach_feedback_reviewed_idx').on(table.reviewedCoachId),
  index('coach_feedback_created_at_idx').on(table.createdAt),
]));

export const feedbackItemTable = sqliteTable("feedback_item", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `fbi_${createId()}`).notNull(),
  feedbackId: text().notNull().references(() => coachFeedbackTable.id),
  category: text({ length: 100 }).notNull(),
  content: text().notNull(),
  sortOrder: integer().notNull(),
}, (table) => ([
  index('feedback_item_feedback_id_idx').on(table.feedbackId),
  index('feedback_item_category_idx').on(table.category),
]));

export const coachRelations = relations(coachTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [coachTable.userId],
    references: [userTable.id],
  }),
  teamAssignments: many(openTeamCoachTable),
  feedbackGiven: many(coachFeedbackTable, { relationName: 'reviewer' }),
  feedbackReceived: many(coachFeedbackTable, { relationName: 'reviewed' }),
}));

export const coachFeedbackRelations = relations(coachFeedbackTable, ({ one, many }) => ({
  reviewer: one(coachTable, {
    fields: [coachFeedbackTable.reviewerCoachId],
    references: [coachTable.id],
    relationName: 'reviewer',
  }),
  reviewed: one(coachTable, {
    fields: [coachFeedbackTable.reviewedCoachId],
    references: [coachTable.id],
    relationName: 'reviewed',
  }),
  items: many(feedbackItemTable),
}));

export const feedbackItemRelations = relations(feedbackItemTable, ({ one }) => ({
  feedback: one(coachFeedbackTable, {
    fields: [feedbackItemTable.feedbackId],
    references: [coachFeedbackTable.id],
  }),
  annotation: one(feedbackItemAnnotationTable),
}));

// Admin annotations overlay for feedback items (keeps originals pure)
export const feedbackItemAnnotationTable = sqliteTable("feedback_item_annotation", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `fba_${createId()}`).notNull(),
  feedbackItemId: text().notNull().references(() => feedbackItemTable.id).unique(),
  revisedContent: text(),
  excluded: integer({ mode: "boolean" }).notNull().default(false),
  adminNote: text(),
});

export const feedbackItemAnnotationRelations = relations(feedbackItemAnnotationTable, ({ one }) => ({
  feedbackItem: one(feedbackItemTable, {
    fields: [feedbackItemAnnotationTable.feedbackItemId],
    references: [feedbackItemTable.id],
  }),
}));

// Feedback question configuration (admin-managed)
export const feedbackQuestionTable = sqliteTable("feedback_question", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(() => `fq_${createId()}`).notNull(),
  category: text({ length: 100 }).notNull(),
  label: text({ length: 255 }).notNull(),
  description: text(),
  placeholder: text(),
  itemCount: integer().notNull().default(3),
  sortOrder: integer().notNull().default(0),
  isActive: integer({ mode: "boolean" }).notNull().default(true),
}, (table) => ([
  index('feedback_question_category_idx').on(table.category),
  index('feedback_question_sort_order_idx').on(table.sortOrder),
]));

// ---------------------------------------------------------------------------
// CrossFit Open intramural (namespaced `open_*`; `team` is the SaaS tenancy table)
// ---------------------------------------------------------------------------

/**
 * Id generators for `open_*` tables — the single source of their prefixes. Used as `$defaultFn`,
 * and by actions that must know a new row's id up front: the audit row in the same `db.batch`
 * has to reference it, and `.returning()` results can't feed a sibling statement in a batch.
 */
export const newOpenId = {
  event: () => `oev_${createId()}`,
  week: () => `owk_${createId()}`,
  team: () => `otm_${createId()}`,
  teamCoach: () => `otc_${createId()}`,
  participant: () => `opp_${createId()}`,
  entry: () => `oen_${createId()}`,
  rule: () => `opr_${createId()}`,
  award: () => `oaw_${createId()}`,
  scaling: () => `osl_${createId()}`,
  workout: () => `owo_${createId()}`,
  score: () => `osc_${createId()}`,
  auditLog: () => `oal_${createId()}`,
} as const;

export const openEventTable = sqliteTable("open_event", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(newOpenId.event).notNull(),
  name: text({ length: 255 }).notNull(),
  slug: text({ length: 255 }).notNull().unique(),
  year: integer().notNull(),
  status: text({
    enum: openEventStatusTuple,
  }).default(OPEN_EVENT_STATUS.DRAFT).notNull(),
  weightUnit: text({
    enum: openWeightUnitTuple,
  }).default(OPEN_WEIGHT_UNIT.LB).notNull(),
  showIndividuals: integer({ mode: "boolean" }).notNull().default(true),
  coachPointsEnabled: integer({ mode: "boolean" }).notNull().default(false),
  coachScoresEnabled: integer({ mode: "boolean" }).notNull().default(false),
}, (table) => ([
  index('open_event_status_idx').on(table.status),
]));

export const openWeekTable = sqliteTable("open_week", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(newOpenId.week).notNull(),
  eventId: text().notNull().references(() => openEventTable.id, { onDelete: "cascade" }),
  number: integer().notNull(),
  label: text({ length: 255 }).notNull(),
  startsAt: integer({ mode: "timestamp" }),
  lockedAt: integer({ mode: "timestamp" }),
}, (table) => ([
  uniqueIndex('open_week_event_number_unique_idx').on(table.eventId, table.number),
]));

export const openTeamTable = sqliteTable("open_team", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(newOpenId.team).notNull(),
  eventId: text().notNull().references(() => openEventTable.id, { onDelete: "cascade" }),
  name: text({ length: 255 }).notNull(),
  slug: text({ length: 255 }).notNull(),
  color: text({ length: 50 }),
  sortOrder: integer().notNull().default(0),
  // Team profile: R2 object key in OPEN_MEDIA (never overwritten; replaced keys are deleted)
  photoKey: text({ length: 255 }),
  motto: text({ length: 140 }),
  description: text(),
}, (table) => ([
  uniqueIndex('open_team_event_slug_unique_idx').on(table.eventId, table.slug),
]));

export const openTeamCoachTable = sqliteTable("open_team_coach", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(newOpenId.teamCoach).notNull(),
  teamId: text().notNull().references(() => openTeamTable.id, { onDelete: "cascade" }),
  coachId: text().notNull().references(() => coachTable.id, { onDelete: "cascade" }),
}, (table) => ([
  uniqueIndex('open_team_coach_unique_idx').on(table.teamId, table.coachId),
  index('open_team_coach_coach_id_idx').on(table.coachId),
]));

export const openParticipantTable = sqliteTable("open_participant", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(newOpenId.participant).notNull(),
  name: text({ length: 255 }).notNull(),
  email: text({ length: 255 }),
  userId: text().references(() => userTable.id, { onDelete: "set null" }),
}, (table) => ([
  index('open_participant_user_id_idx').on(table.userId),
  index('open_participant_email_idx').on(table.email),
]));

export const openEntryTable = sqliteTable("open_entry", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(newOpenId.entry).notNull(),
  eventId: text().notNull().references(() => openEventTable.id, { onDelete: "cascade" }),
  participantId: text().notNull().references(() => openParticipantTable.id),
  // No onDelete: a team with entries can't be deleted (reassign first). Points follow current teamId.
  teamId: text().references(() => openTeamTable.id),
  division: text({ length: 100 }),
}, (table) => ([
  uniqueIndex('open_entry_event_participant_unique_idx').on(table.eventId, table.participantId),
  index('open_entry_participant_id_idx').on(table.participantId),
  index('open_entry_team_id_idx').on(table.teamId),
]));

export const openPointRuleTable = sqliteTable("open_point_rule", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(newOpenId.rule).notNull(),
  eventId: text().notNull().references(() => openEventTable.id, { onDelete: "cascade" }),
  name: text({ length: 255 }).notNull(),
  description: text(),
  points: integer().notNull(),
  cadence: text({
    enum: openRuleCadenceTuple,
  }).default(OPEN_RULE_CADENCE.PER_WEEK).notNull(),
  coachAwardable: integer({ mode: "boolean" }).notNull().default(true),
  sortOrder: integer().notNull().default(0),
  isActive: integer({ mode: "boolean" }).notNull().default(true),
}, (table) => ([
  index('open_point_rule_event_id_idx').on(table.eventId),
]));

/**
 * One ledger of point awards. `points` is snapshotted from the rule at award time.
 * `dedupeKey` is derived from the rule's cadence by the award-writing function:
 * per_week → weekId, once_per_event → "event", unlimited → null (NULLs are distinct in SQLite).
 */
export const openAwardTable = sqliteTable("open_award", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(newOpenId.award).notNull(),
  entryId: text().notNull().references(() => openEntryTable.id, { onDelete: "cascade" }),
  // No onDelete on rule/week: deleting a rule or week with awards fails (retire rules via isActive)
  ruleId: text().notNull().references(() => openPointRuleTable.id),
  weekId: text().references(() => openWeekTable.id),
  points: integer().notNull(),
  dedupeKey: text({ length: 255 }),
  note: text(),
  awardedByUserId: text().references(() => userTable.id, { onDelete: "set null" }),
}, (table) => ([
  uniqueIndex('open_award_entry_rule_dedupe_unique_idx').on(table.entryId, table.ruleId, table.dedupeKey),
  check('open_award_dedupe_key_check', sql`${table.dedupeKey} IS NULL OR ${table.dedupeKey} = 'event' OR ${table.dedupeKey} = ${table.weekId}`),
  index('open_award_rule_id_idx').on(table.ruleId),
  index('open_award_week_id_idx').on(table.weekId),
]));

export const openScalingTable = sqliteTable("open_scaling", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(newOpenId.scaling).notNull(),
  eventId: text().notNull().references(() => openEventTable.id, { onDelete: "cascade" }),
  name: text({ length: 255 }).notNull(),
  slug: text({ length: 255 }).notNull(),
  // Lower rank = better (Rx = 0); also the display order
  rank: integer().notNull(),
}, (table) => ([
  uniqueIndex('open_scaling_event_slug_unique_idx').on(table.eventId, table.slug),
]));

export const openWorkoutTable = sqliteTable("open_workout", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(newOpenId.workout).notNull(),
  eventId: text().notNull().references(() => openEventTable.id, { onDelete: "cascade" }),
  weekId: text().references(() => openWeekTable.id, { onDelete: "set null" }),
  name: text({ length: 255 }).notNull(),
  slug: text({ length: 255 }).notNull(),
  description: text(),
  scoreType: text({
    enum: openScoreTypeTuple,
  }).notNull(),
  timeCapSeconds: integer(),
  repsPerRound: integer(),
  hasTiebreak: integer({ mode: "boolean" }).notNull().default(false),
  sortOrder: integer().notNull().default(0),
}, (table) => ([
  uniqueIndex('open_workout_event_slug_unique_idx').on(table.eventId, table.slug),
  index('open_workout_week_id_idx').on(table.weekId),
]));

/**
 * Canonical `value`: time → ms; time & capped → reps; reps → count;
 * rounds_reps → total reps (rounds × repsPerRound + reps); load → grams; points → int.
 */
export const openScoreTable = sqliteTable("open_score", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(newOpenId.score).notNull(),
  entryId: text().notNull().references(() => openEntryTable.id, { onDelete: "cascade" }),
  workoutId: text().notNull().references(() => openWorkoutTable.id, { onDelete: "cascade" }),
  scalingId: text().notNull().references(() => openScalingTable.id),
  value: integer().notNull(),
  capped: integer({ mode: "boolean" }).notNull().default(false),
  tiebreakMs: integer(),
  note: text(),
  enteredByUserId: text().references(() => userTable.id, { onDelete: "set null" }),
}, (table) => ([
  uniqueIndex('open_score_entry_workout_unique_idx').on(table.entryId, table.workoutId),
  index('open_score_workout_id_idx').on(table.workoutId),
  index('open_score_scaling_id_idx').on(table.scalingId),
]));

/**
 * Append-only audit trail of every Open mutation. Rows are written in the same `db.batch`
 * as the change they describe. Never update or delete rows in this table.
 */
export const openAuditLogTable = sqliteTable("open_audit_log", {
  ...commonColumns,
  id: text().primaryKey().$defaultFn(newOpenId.auditLog).notNull(),
  // Plain column, not an FK: audit rows must outlive the event; some entities aren't event-scoped
  eventId: text(),
  actorUserId: text().references(() => userTable.id, { onDelete: "set null" }),
  action: text({
    enum: openAuditVerbTuple,
  }).notNull(),
  entityType: text({
    enum: openAuditEntityTuple,
  }).notNull(),
  entityId: text().notNull(),
  // JSON snapshots of the entity before/after the change (null for create/delete respectively)
  before: text(),
  after: text(),
  // Human-readable one-liner, e.g. "Awarded Costume (1) to Jane Doe for Week 2"
  summary: text(),
}, (table) => ([
  index('open_audit_log_event_created_at_idx').on(table.eventId, table.createdAt),
  index('open_audit_log_entity_idx').on(table.entityType, table.entityId),
  index('open_audit_log_actor_user_id_idx').on(table.actorUserId),
]));

export const openEventRelations = relations(openEventTable, ({ many }) => ({
  weeks: many(openWeekTable),
  teams: many(openTeamTable),
  entries: many(openEntryTable),
  rules: many(openPointRuleTable),
  scalings: many(openScalingTable),
  workouts: many(openWorkoutTable),
  auditLogs: many(openAuditLogTable),
}));

export const openWeekRelations = relations(openWeekTable, ({ one, many }) => ({
  event: one(openEventTable, {
    fields: [openWeekTable.eventId],
    references: [openEventTable.id],
  }),
  awards: many(openAwardTable),
  workouts: many(openWorkoutTable),
}));

export const openTeamRelations = relations(openTeamTable, ({ one, many }) => ({
  event: one(openEventTable, {
    fields: [openTeamTable.eventId],
    references: [openEventTable.id],
  }),
  coaches: many(openTeamCoachTable),
  entries: many(openEntryTable),
}));

export const openTeamCoachRelations = relations(openTeamCoachTable, ({ one }) => ({
  team: one(openTeamTable, {
    fields: [openTeamCoachTable.teamId],
    references: [openTeamTable.id],
  }),
  coach: one(coachTable, {
    fields: [openTeamCoachTable.coachId],
    references: [coachTable.id],
  }),
}));

export const openParticipantRelations = relations(openParticipantTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [openParticipantTable.userId],
    references: [userTable.id],
  }),
  entries: many(openEntryTable),
}));

export const openEntryRelations = relations(openEntryTable, ({ one, many }) => ({
  event: one(openEventTable, {
    fields: [openEntryTable.eventId],
    references: [openEventTable.id],
  }),
  participant: one(openParticipantTable, {
    fields: [openEntryTable.participantId],
    references: [openParticipantTable.id],
  }),
  team: one(openTeamTable, {
    fields: [openEntryTable.teamId],
    references: [openTeamTable.id],
  }),
  awards: many(openAwardTable),
  scores: many(openScoreTable),
}));

export const openPointRuleRelations = relations(openPointRuleTable, ({ one, many }) => ({
  event: one(openEventTable, {
    fields: [openPointRuleTable.eventId],
    references: [openEventTable.id],
  }),
  awards: many(openAwardTable),
}));

export const openAwardRelations = relations(openAwardTable, ({ one }) => ({
  entry: one(openEntryTable, {
    fields: [openAwardTable.entryId],
    references: [openEntryTable.id],
  }),
  rule: one(openPointRuleTable, {
    fields: [openAwardTable.ruleId],
    references: [openPointRuleTable.id],
  }),
  week: one(openWeekTable, {
    fields: [openAwardTable.weekId],
    references: [openWeekTable.id],
  }),
  awardedByUser: one(userTable, {
    fields: [openAwardTable.awardedByUserId],
    references: [userTable.id],
  }),
}));

export const openScalingRelations = relations(openScalingTable, ({ one, many }) => ({
  event: one(openEventTable, {
    fields: [openScalingTable.eventId],
    references: [openEventTable.id],
  }),
  scores: many(openScoreTable),
}));

export const openWorkoutRelations = relations(openWorkoutTable, ({ one, many }) => ({
  event: one(openEventTable, {
    fields: [openWorkoutTable.eventId],
    references: [openEventTable.id],
  }),
  week: one(openWeekTable, {
    fields: [openWorkoutTable.weekId],
    references: [openWeekTable.id],
  }),
  scores: many(openScoreTable),
}));

export const openScoreRelations = relations(openScoreTable, ({ one }) => ({
  entry: one(openEntryTable, {
    fields: [openScoreTable.entryId],
    references: [openEntryTable.id],
  }),
  workout: one(openWorkoutTable, {
    fields: [openScoreTable.workoutId],
    references: [openWorkoutTable.id],
  }),
  scaling: one(openScalingTable, {
    fields: [openScoreTable.scalingId],
    references: [openScalingTable.id],
  }),
  enteredByUser: one(userTable, {
    fields: [openScoreTable.enteredByUserId],
    references: [userTable.id],
  }),
}));

export const openAuditLogRelations = relations(openAuditLogTable, ({ one }) => ({
  event: one(openEventTable, {
    fields: [openAuditLogTable.eventId],
    references: [openEventTable.id],
  }),
  actorUser: one(userTable, {
    fields: [openAuditLogTable.actorUserId],
    references: [userTable.id],
  }),
}));

export type User = InferSelectModel<typeof userTable>;
export type PassKeyCredential = InferSelectModel<typeof passKeyCredentialTable>;
export type CreditTransaction = InferSelectModel<typeof creditTransactionTable>;
export type PurchasedItem = InferSelectModel<typeof purchasedItemsTable>;
export type Team = InferSelectModel<typeof teamTable>;
export type TeamMembership = InferSelectModel<typeof teamMembershipTable>;
export type TeamRole = InferSelectModel<typeof teamRoleTable>;
export type TeamInvitation = InferSelectModel<typeof teamInvitationTable>;
export type Coach = InferSelectModel<typeof coachTable>;
export type CoachFeedback = InferSelectModel<typeof coachFeedbackTable>;
export type FeedbackItem = InferSelectModel<typeof feedbackItemTable>;
export type FeedbackQuestion = InferSelectModel<typeof feedbackQuestionTable>;
export type FeedbackItemAnnotation = InferSelectModel<typeof feedbackItemAnnotationTable>;
export type OpenEvent = InferSelectModel<typeof openEventTable>;
export type OpenWeek = InferSelectModel<typeof openWeekTable>;
export type OpenTeam = InferSelectModel<typeof openTeamTable>;
export type OpenTeamCoach = InferSelectModel<typeof openTeamCoachTable>;
export type OpenParticipant = InferSelectModel<typeof openParticipantTable>;
export type OpenEntry = InferSelectModel<typeof openEntryTable>;
export type OpenPointRule = InferSelectModel<typeof openPointRuleTable>;
export type OpenAward = InferSelectModel<typeof openAwardTable>;
export type OpenScaling = InferSelectModel<typeof openScalingTable>;
export type OpenWorkout = InferSelectModel<typeof openWorkoutTable>;
export type OpenScore = InferSelectModel<typeof openScoreTable>;
export type OpenAuditLog = InferSelectModel<typeof openAuditLogTable>;
