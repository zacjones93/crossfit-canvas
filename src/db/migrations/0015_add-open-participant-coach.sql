ALTER TABLE `open_event` ADD `autoRosterCoaches` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `open_participant` ADD `coachId` text REFERENCES coach(id) ON DELETE set null;--> statement-breakpoint
CREATE UNIQUE INDEX `open_participant_coachId_unique` ON `open_participant` (`coachId`);