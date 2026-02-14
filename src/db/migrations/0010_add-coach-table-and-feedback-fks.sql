-- Create coach table
CREATE TABLE `coach` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`slug` text(255) NOT NULL,
	`credentials` text(255),
	`bio` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coach_slug_unique` ON `coach` (`slug`);
--> statement-breakpoint
CREATE INDEX `coach_slug_idx` ON `coach` (`slug`);
--> statement-breakpoint
CREATE INDEX `coach_name_idx` ON `coach` (`name`);
--> statement-breakpoint

-- Drop feedback_item first (references coach_feedback)
DROP INDEX IF EXISTS `feedback_item_feedback_id_idx`;
--> statement-breakpoint
DROP INDEX IF EXISTS `feedback_item_category_idx`;
--> statement-breakpoint
DROP TABLE IF EXISTS `feedback_item`;
--> statement-breakpoint

-- Drop old coach_feedback indexes and table
DROP INDEX IF EXISTS `coach_feedback_reviewer_idx`;
--> statement-breakpoint
DROP INDEX IF EXISTS `coach_feedback_reviewed_idx`;
--> statement-breakpoint
DROP INDEX IF EXISTS `coach_feedback_created_at_idx`;
--> statement-breakpoint
DROP TABLE IF EXISTS `coach_feedback`;
--> statement-breakpoint

-- Recreate coach_feedback with foreign keys to coach table
CREATE TABLE `coach_feedback` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`reviewerCoachId` text NOT NULL REFERENCES `coach`(`id`),
	`reviewedCoachId` text NOT NULL REFERENCES `coach`(`id`)
);
--> statement-breakpoint
CREATE INDEX `coach_feedback_reviewer_idx` ON `coach_feedback` (`reviewerCoachId`);
--> statement-breakpoint
CREATE INDEX `coach_feedback_reviewed_idx` ON `coach_feedback` (`reviewedCoachId`);
--> statement-breakpoint
CREATE INDEX `coach_feedback_created_at_idx` ON `coach_feedback` (`createdAt`);
--> statement-breakpoint

-- Recreate feedback_item referencing new coach_feedback
CREATE TABLE `feedback_item` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`feedbackId` text NOT NULL REFERENCES `coach_feedback`(`id`),
	`category` text(100) NOT NULL,
	`content` text NOT NULL,
	`sortOrder` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `feedback_item_feedback_id_idx` ON `feedback_item` (`feedbackId`);
--> statement-breakpoint
CREATE INDEX `feedback_item_category_idx` ON `feedback_item` (`category`);
