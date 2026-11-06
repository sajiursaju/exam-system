/*
  Warnings:

  - You are about to drop the column `created_by` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `exam_attempts` DROP FOREIGN KEY `exam_attempts_student_id_fkey`;

-- DropForeignKey
ALTER TABLE `exams` DROP FOREIGN KEY `exams_created_by_fkey`;

-- DropIndex
DROP INDEX `exams_created_by_fkey` ON `exams`;

-- AlterTable
ALTER TABLE `exams` DROP COLUMN `created_by`,
    ADD COLUMN `created_by_admin_id` INTEGER NULL,
    ADD COLUMN `created_by_teacher_id` INTEGER NULL;

-- DropTable
DROP TABLE `users`;

-- CreateTable
CREATE TABLE `admins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'DEACTIVATED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `phone` VARCHAR(20) NULL,
    `address` TEXT NULL,
    `avatar_url` VARCHAR(255) NULL,

    UNIQUE INDEX `admins_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teachers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'DEACTIVATED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `phone` VARCHAR(20) NULL,
    `address` TEXT NULL,
    `avatar_url` VARCHAR(255) NULL,
    `designation` VARCHAR(100) NULL,
    `subject` VARCHAR(100) NULL,
    `qualification` VARCHAR(150) NULL,
    `bio` TEXT NULL,

    UNIQUE INDEX `teachers_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'DEACTIVATED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `phone` VARCHAR(20) NULL,
    `address` TEXT NULL,
    `avatar_url` VARCHAR(255) NULL,
    `student_code` VARCHAR(50) NULL,
    `institute` VARCHAR(150) NULL,
    `target_exam` VARCHAR(100) NULL,
    `date_of_birth` DATETIME(3) NULL,

    UNIQUE INDEX `students_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `exams` ADD CONSTRAINT `exams_created_by_admin_id_fkey` FOREIGN KEY (`created_by_admin_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exams` ADD CONSTRAINT `exams_created_by_teacher_id_fkey` FOREIGN KEY (`created_by_teacher_id`) REFERENCES `teachers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_attempts` ADD CONSTRAINT `exam_attempts_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
