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
CREATE INDEX `Story_published_createdAt_idx` ON `Story`(`published`, `createdAt` DESC);

-- CreateIndex
CREATE INDEX `Story_published_storyType_createdAt_idx` ON `Story`(`published`, `storyType`, `createdAt` DESC);

-- CreateIndex
CREATE INDEX `Story_published_city_createdAt_idx` ON `Story`(`published`, `city`, `createdAt` DESC);

-- CreateIndex
CREATE INDEX `Story_published_intensity_createdAt_idx` ON `Story`(`published`, `intensity`, `createdAt` DESC);

-- CreateIndex
CREATE INDEX `Story_published_storyType_intensity_createdAt_idx` ON `Story`(`published`, `storyType`, `intensity`, `createdAt` DESC);

-- CreateIndex
CREATE INDEX `StoryImage_storyId_sectionIdx_idx` ON `StoryImage`(`storyId`, `sectionIdx`);
