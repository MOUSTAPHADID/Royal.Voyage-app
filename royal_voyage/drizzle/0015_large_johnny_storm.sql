ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `booking_contacts` DROP COLUMN `bookingStatus`;--> statement-breakpoint
ALTER TABLE `business_accounts` DROP COLUMN `userId`;
