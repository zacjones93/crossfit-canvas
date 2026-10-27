CREATE TABLE `open_audit_log` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`eventId` text,
	`actorUserId` text,
	`action` text NOT NULL,
	`entityType` text NOT NULL,
	`entityId` text NOT NULL,
	`before` text,
	`after` text,
	`summary` text,
	FOREIGN KEY (`actorUserId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `open_audit_log_event_created_at_idx` ON `open_audit_log` (`eventId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `open_audit_log_entity_idx` ON `open_audit_log` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `open_audit_log_actor_user_id_idx` ON `open_audit_log` (`actorUserId`);--> statement-breakpoint
CREATE TABLE `open_award` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`entryId` text NOT NULL,
	`ruleId` text NOT NULL,
	`weekId` text,
	`points` integer NOT NULL,
	`dedupeKey` text(255),
	`note` text,
	`awardedByUserId` text,
	FOREIGN KEY (`entryId`) REFERENCES `open_entry`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ruleId`) REFERENCES `open_point_rule`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`weekId`) REFERENCES `open_week`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`awardedByUserId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "open_award_dedupe_key_check" CHECK("open_award"."dedupeKey" IS NULL OR "open_award"."dedupeKey" = 'event' OR "open_award"."dedupeKey" = "open_award"."weekId")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `open_award_entry_rule_dedupe_unique_idx` ON `open_award` (`entryId`,`ruleId`,`dedupeKey`);--> statement-breakpoint
CREATE INDEX `open_award_rule_id_idx` ON `open_award` (`ruleId`);--> statement-breakpoint
CREATE INDEX `open_award_week_id_idx` ON `open_award` (`weekId`);--> statement-breakpoint
CREATE TABLE `open_entry` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`eventId` text NOT NULL,
	`participantId` text NOT NULL,
	`teamId` text,
	`division` text(100),
	FOREIGN KEY (`eventId`) REFERENCES `open_event`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`participantId`) REFERENCES `open_participant`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`teamId`) REFERENCES `open_team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `open_entry_event_participant_unique_idx` ON `open_entry` (`eventId`,`participantId`);--> statement-breakpoint
CREATE INDEX `open_entry_participant_id_idx` ON `open_entry` (`participantId`);--> statement-breakpoint
CREATE INDEX `open_entry_team_id_idx` ON `open_entry` (`teamId`);--> statement-breakpoint
CREATE TABLE `open_event` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`slug` text(255) NOT NULL,
	`year` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`weightUnit` text DEFAULT 'lb' NOT NULL,
	`showIndividuals` integer DEFAULT true NOT NULL,
	`coachPointsEnabled` integer DEFAULT false NOT NULL,
	`coachScoresEnabled` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `open_event_slug_unique` ON `open_event` (`slug`);--> statement-breakpoint
CREATE INDEX `open_event_status_idx` ON `open_event` (`status`);--> statement-breakpoint
CREATE TABLE `open_participant` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`email` text(255),
	`userId` text,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `open_participant_user_id_idx` ON `open_participant` (`userId`);--> statement-breakpoint
CREATE INDEX `open_participant_email_idx` ON `open_participant` (`email`);--> statement-breakpoint
CREATE TABLE `open_point_rule` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`eventId` text NOT NULL,
	`name` text(255) NOT NULL,
	`description` text,
	`points` integer NOT NULL,
	`cadence` text DEFAULT 'per_week' NOT NULL,
	`coachAwardable` integer DEFAULT true NOT NULL,
	`sortOrder` integer DEFAULT 0 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`eventId`) REFERENCES `open_event`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `open_point_rule_event_id_idx` ON `open_point_rule` (`eventId`);--> statement-breakpoint
CREATE TABLE `open_scaling` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`eventId` text NOT NULL,
	`name` text(255) NOT NULL,
	`slug` text(255) NOT NULL,
	`rank` integer NOT NULL,
	FOREIGN KEY (`eventId`) REFERENCES `open_event`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `open_scaling_event_slug_unique_idx` ON `open_scaling` (`eventId`,`slug`);--> statement-breakpoint
CREATE TABLE `open_score` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`entryId` text NOT NULL,
	`workoutId` text NOT NULL,
	`scalingId` text NOT NULL,
	`value` integer NOT NULL,
	`capped` integer DEFAULT false NOT NULL,
	`tiebreakMs` integer,
	`note` text,
	`enteredByUserId` text,
	FOREIGN KEY (`entryId`) REFERENCES `open_entry`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workoutId`) REFERENCES `open_workout`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`scalingId`) REFERENCES `open_scaling`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`enteredByUserId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `open_score_entry_workout_unique_idx` ON `open_score` (`entryId`,`workoutId`);--> statement-breakpoint
CREATE INDEX `open_score_workout_id_idx` ON `open_score` (`workoutId`);--> statement-breakpoint
CREATE INDEX `open_score_scaling_id_idx` ON `open_score` (`scalingId`);--> statement-breakpoint
CREATE TABLE `open_team_coach` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`teamId` text NOT NULL,
	`coachId` text NOT NULL,
	FOREIGN KEY (`teamId`) REFERENCES `open_team`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`coachId`) REFERENCES `coach`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `open_team_coach_unique_idx` ON `open_team_coach` (`teamId`,`coachId`);--> statement-breakpoint
CREATE INDEX `open_team_coach_coach_id_idx` ON `open_team_coach` (`coachId`);--> statement-breakpoint
CREATE TABLE `open_team` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`eventId` text NOT NULL,
	`name` text(255) NOT NULL,
	`slug` text(255) NOT NULL,
	`color` text(50),
	`sortOrder` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`eventId`) REFERENCES `open_event`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `open_team_event_slug_unique_idx` ON `open_team` (`eventId`,`slug`);--> statement-breakpoint
CREATE TABLE `open_week` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`eventId` text NOT NULL,
	`number` integer NOT NULL,
	`label` text(255) NOT NULL,
	`startsAt` integer,
	`lockedAt` integer,
	FOREIGN KEY (`eventId`) REFERENCES `open_event`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `open_week_event_number_unique_idx` ON `open_week` (`eventId`,`number`);--> statement-breakpoint
CREATE TABLE `open_workout` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`eventId` text NOT NULL,
	`weekId` text,
	`name` text(255) NOT NULL,
	`slug` text(255) NOT NULL,
	`description` text,
	`scoreType` text NOT NULL,
	`timeCapSeconds` integer,
	`repsPerRound` integer,
	`hasTiebreak` integer DEFAULT false NOT NULL,
	`sortOrder` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`eventId`) REFERENCES `open_event`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`weekId`) REFERENCES `open_week`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `open_workout_event_slug_unique_idx` ON `open_workout` (`eventId`,`slug`);--> statement-breakpoint
CREATE INDEX `open_workout_week_id_idx` ON `open_workout` (`weekId`);--> statement-breakpoint
ALTER TABLE `coach` ADD `userId` text REFERENCES user(id) ON DELETE set null;--> statement-breakpoint
CREATE UNIQUE INDEX `coach_userId_unique` ON `coach` (`userId`);