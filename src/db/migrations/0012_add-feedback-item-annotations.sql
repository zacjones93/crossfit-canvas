CREATE TABLE `feedback_item_annotation` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`feedbackItemId` text NOT NULL REFERENCES `feedback_item`(`id`),
	`revisedContent` text,
	`excluded` integer NOT NULL DEFAULT 0,
	`adminNote` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feedback_item_annotation_feedbackItemId_unique` ON `feedback_item_annotation` (`feedbackItemId`);
