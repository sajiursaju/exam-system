-- AlterTable
ALTER TABLE `users` ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `avatar_url` VARCHAR(255) NULL,
    ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `date_of_birth` DATETIME(3) NULL,
    ADD COLUMN `designation` VARCHAR(100) NULL,
    ADD COLUMN `institute` VARCHAR(150) NULL,
    ADD COLUMN `phone` VARCHAR(20) NULL,
    ADD COLUMN `qualification` VARCHAR(150) NULL,
    ADD COLUMN `student_code` VARCHAR(50) NULL,
    ADD COLUMN `subject` VARCHAR(100) NULL,
    ADD COLUMN `target_exam` VARCHAR(100) NULL;
