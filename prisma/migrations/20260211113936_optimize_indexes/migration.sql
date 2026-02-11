-- DropIndex
DROP INDEX `Story_city_idx` ON `Story`;

-- DropIndex
DROP INDEX `Story_createdAt_idx` ON `Story`;

-- DropIndex
DROP INDEX `Story_intensity_idx` ON `Story`;

-- DropIndex
DROP INDEX `Story_published_createdAt_idx` ON `Story`;

-- DropIndex
DROP INDEX `Story_published_idx` ON `Story`;

-- DropIndex
DROP INDEX `Story_published_storyType_idx` ON `Story`;

-- DropIndex
DROP INDEX `Story_published_storyType_intensity_idx` ON `Story`;

-- DropIndex
DROP INDEX `Story_storyType_idx` ON `Story`;

-- CreateIndex
CREATE INDEX `Story_published_createdAt_idx` ON `Story`(`published`, `createdAt`);

-- CreateIndex
CREATE INDEX `Story_published_storyType_createdAt_idx` ON `Story`(`published`, `storyType`, `createdAt`);

-- CreateIndex
CREATE INDEX `Story_published_city_createdAt_idx` ON `Story`(`published`, `city`, `createdAt`);

-- CreateIndex
CREATE INDEX `Story_published_intensity_createdAt_idx` ON `Story`(`published`, `intensity`, `createdAt`);

-- CreateIndex
CREATE INDEX `Story_published_storyType_intensity_createdAt_idx` ON `Story`(`published`, `storyType`, `intensity`, `createdAt`);

-- CreateIndex
CREATE INDEX `StoryImage_storyId_sectionIdx_idx` ON `StoryImage`(`storyId`, `sectionIdx`);
