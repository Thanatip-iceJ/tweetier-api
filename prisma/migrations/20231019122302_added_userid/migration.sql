/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `commentedById` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `likedById` to the `PostLike` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `comment` ADD COLUMN `commentedById` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `postlike` ADD COLUMN `likedById` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_commentedById_fkey` FOREIGN KEY (`commentedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostLike` ADD CONSTRAINT `PostLike_likedById_fkey` FOREIGN KEY (`likedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
