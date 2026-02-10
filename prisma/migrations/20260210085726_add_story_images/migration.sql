/*
  Warnings:

  - You are about to drop the `Camgirl` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `Story` ADD COLUMN `city` VARCHAR(200) NULL,
    ADD COLUMN `femaleAppearance` TEXT NULL,
    ADD COLUMN `intensity` INTEGER NOT NULL DEFAULT 5,
    ADD COLUMN `locationId` VARCHAR(191) NULL,
    ADD COLUMN `storyType` VARCHAR(50) NOT NULL DEFAULT 'real';

-- DropTable
DROP TABLE `Camgirl`;

-- CreateTable
CREATE TABLE `StoryImage` (
    `id` VARCHAR(191) NOT NULL,
    `storyId` VARCHAR(191) NOT NULL,
    `sectionIdx` INTEGER NOT NULL,
    `heading` VARCHAR(500) NULL,
    `prompt` TEXT NOT NULL,
    `filename` VARCHAR(500) NOT NULL,
    `width` INTEGER NOT NULL DEFAULT 1024,
    `height` INTEGER NOT NULL DEFAULT 1024,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `StoryImage_storyId_idx`(`storyId`),
    UNIQUE INDEX `StoryImage_storyId_sectionIdx_key`(`storyId`, `sectionIdx`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Location` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `storyType` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Location_slug_key`(`slug`),
    INDEX `Location_storyType_idx`(`storyType`),
    INDEX `Location_slug_idx`(`slug`),
    UNIQUE INDEX `Location_name_storyType_key`(`name`, `storyType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Story_locationId_idx` ON `Story`(`locationId`);

-- CreateIndex
CREATE INDEX `Story_storyType_idx` ON `Story`(`storyType`);

-- CreateIndex
CREATE INDEX `Story_intensity_idx` ON `Story`(`intensity`);

-- CreateIndex
CREATE INDEX `Story_city_idx` ON `Story`(`city`);

-- CreateIndex
CREATE INDEX `Story_published_storyType_idx` ON `Story`(`published`, `storyType`);

-- CreateIndex
CREATE INDEX `Story_published_createdAt_idx` ON `Story`(`published`, `createdAt`);

-- CreateIndex
CREATE INDEX `Story_published_storyType_intensity_idx` ON `Story`(`published`, `storyType`, `intensity`);

-- AddForeignKey
ALTER TABLE `Story` ADD CONSTRAINT `Story_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoryImage` ADD CONSTRAINT `StoryImage_storyId_fkey` FOREIGN KEY (`storyId`) REFERENCES `Story`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
