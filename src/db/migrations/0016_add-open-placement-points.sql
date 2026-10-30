ALTER TABLE `open_participant` ADD `gender` text;--> statement-breakpoint
ALTER TABLE `open_scaling` ADD `placementFirst` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `open_scaling` ADD `placementStep` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `open_scaling` ADD `placementMin` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `open_scaling` ADD `placementPerTeam` integer DEFAULT 0 NOT NULL;