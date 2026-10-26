-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'TEACHER', 'STUDENT') NOT NULL DEFAULT 'STUDENT',
    `status` ENUM('PENDING', 'ACTIVE', 'DEACTIVATED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exams` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `duration_minutes` INTEGER NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `total_marks` INTEGER NOT NULL,
    `passing_marks` INTEGER NOT NULL,
    `shuffle_questions` BOOLEAN NOT NULL DEFAULT false,
    `max_tab_switches` INTEGER NOT NULL DEFAULT 3,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `exams_start_time_end_time_idx`(`start_time`, `end_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `exam_id` INTEGER NOT NULL,
    `question_text` TEXT NOT NULL,
    `question_type` ENUM('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER') NOT NULL,
    `options` JSON NULL,
    `correct_answer` TEXT NULL,
    `marks` INTEGER NOT NULL DEFAULT 1,

    INDEX `questions_exam_id_idx`(`exam_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_attempts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NOT NULL,
    `exam_id` INTEGER NOT NULL,
    `start_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `end_time` DATETIME(3) NULL,
    `status` ENUM('IN_PROGRESS', 'SUBMITTED', 'AUTO_SUBMITTED', 'GRADED') NOT NULL DEFAULT 'IN_PROGRESS',
    `total_score` DOUBLE NOT NULL DEFAULT 0,
    `tab_switch_count` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `exam_attempts_student_id_exam_id_key`(`student_id`, `exam_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_answers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attempt_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `selected_answer` TEXT NULL,
    `marked_review` BOOLEAN NOT NULL DEFAULT false,
    `is_correct` BOOLEAN NULL,
    `marks_obtained` DOUBLE NOT NULL DEFAULT 0,

    UNIQUE INDEX `student_answers_attempt_id_question_id_key`(`attempt_id`, `question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `exams` ADD CONSTRAINT `exams_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_attempts` ADD CONSTRAINT `exam_attempts_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_attempts` ADD CONSTRAINT `exam_attempts_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_answers` ADD CONSTRAINT `student_answers_attempt_id_fkey` FOREIGN KEY (`attempt_id`) REFERENCES `exam_attempts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_answers` ADD CONSTRAINT `student_answers_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
