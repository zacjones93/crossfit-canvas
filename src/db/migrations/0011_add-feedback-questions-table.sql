CREATE TABLE `feedback_question` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`category` text(100) NOT NULL,
	`label` text(255) NOT NULL,
	`description` text,
	`placeholder` text,
	`itemCount` integer NOT NULL DEFAULT 3,
	`sortOrder` integer NOT NULL DEFAULT 0,
	`isActive` integer NOT NULL DEFAULT 1
);
--> statement-breakpoint
CREATE INDEX `feedback_question_category_idx` ON `feedback_question` (`category`);
--> statement-breakpoint
CREATE INDEX `feedback_question_sort_order_idx` ON `feedback_question` (`sortOrder`);
