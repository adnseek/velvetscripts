-- CreateTable
CREATE TABLE `Story` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `content` TEXT NOT NULL,
    `theme` VARCHAR(100) NOT NULL,
    `style` VARCHAR(100) NOT NULL,
    `excerpt` TEXT NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `views` INTEGER NOT NULL DEFAULT 0,
    `seoTitle` VARCHAR(500) NULL,
    `seoDescription` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Story_slug_key`(`slug`),
    INDEX `Story_slug_idx`(`slug`),
    INDEX `Story_published_idx`(`published`),
    INDEX `Story_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Camgirl` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `imageUrl` VARCHAR(500) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `affiliateLink` VARCHAR(500) NOT NULL,
    `platform` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `online` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Camgirl_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
