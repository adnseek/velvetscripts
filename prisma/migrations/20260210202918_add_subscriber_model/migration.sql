-- AlterTable
ALTER TABLE `Story` ADD COLUMN `heroImage` VARCHAR(500) NULL;

-- CreateTable
CREATE TABLE `Subscriber` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(300) NOT NULL,
    `unsubscribeKey` VARCHAR(100) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Subscriber_email_key`(`email`),
    UNIQUE INDEX `Subscriber_unsubscribeKey_key`(`unsubscribeKey`),
    INDEX `Subscriber_active_idx`(`active`),
    INDEX `Subscriber_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Submission` (
    `id` VARCHAR(191) NOT NULL,
    `authorName` VARCHAR(200) NOT NULL,
    `authorEmail` VARCHAR(300) NULL,
    `title` VARCHAR(500) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `adminNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Submission_status_idx`(`status`),
    INDEX `Submission_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
