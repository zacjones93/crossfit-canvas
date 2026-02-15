CREATE TABLE `coach_feedback` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`reviewerCoachName` text(255) NOT NULL,
	`reviewedCoachName` text(255) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `coach_feedback_reviewer_idx` ON `coach_feedback` (`reviewerCoachName`);--> statement-breakpoint
CREATE INDEX `coach_feedback_reviewed_idx` ON `coach_feedback` (`reviewedCoachName`);--> statement-breakpoint
CREATE INDEX `coach_feedback_created_at_idx` ON `coach_feedback` (`createdAt`);--> statement-breakpoint
CREATE TABLE `feedback_item` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`feedbackId` text NOT NULL,
	`category` text(100) NOT NULL,
	`content` text NOT NULL,
	`sortOrder` integer NOT NULL,
	FOREIGN KEY (`feedbackId`) REFERENCES `coach_feedback`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `feedback_item_feedback_id_idx` ON `feedback_item` (`feedbackId`);--> statement-breakpoint
CREATE INDEX `feedback_item_category_idx` ON `feedback_item` (`category`);