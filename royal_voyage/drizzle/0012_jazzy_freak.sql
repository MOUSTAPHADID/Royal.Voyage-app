ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','partner') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `booking_contacts` ADD `partnerId` int;--> statement-breakpoint
ALTER TABLE `booking_contacts` ADD `bookingStatus` varchar(32) DEFAULT 'new';--> statement-breakpoint
ALTER TABLE `booking_contacts` ADD `commissionAmount` decimal(12,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `booking_contacts` ADD `commissionStatus` varchar(32) DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `business_accounts` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `business_accounts` ADD `partnerCode` varchar(64);--> statement-breakpoint
ALTER TABLE `business_accounts` ADD `referralLink` varchar(512);--> statement-breakpoint
ALTER TABLE `business_accounts` ADD CONSTRAINT `business_accounts_partnerCode_unique` UNIQUE(`partnerCode`);