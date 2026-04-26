ALTER TABLE `booking_contacts` ADD `emailStatus` varchar(32) DEFAULT 'not_sent';--> statement-breakpoint
ALTER TABLE `booking_contacts` ADD `lastEmailSentAt` timestamp;--> statement-breakpoint
ALTER TABLE `booking_contacts` ADD `emailError` text;