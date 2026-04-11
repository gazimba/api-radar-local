/*
  Warnings:

  - You are about to drop the column `cidadeId` on the `evento` table. All the data in the column will be lost.
  - You are about to drop the column `imagemUrl` on the `evento` table. All the data in the column will be lost.
  - You are about to drop the column `cidadeId` on the `pontoturistico` table. All the data in the column will be lost.
  - You are about to drop the column `imagemUrl` on the `pontoturistico` table. All the data in the column will be lost.
  - You are about to drop the `cidade` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `evento` DROP FOREIGN KEY `Evento_cidadeId_fkey`;

-- DropForeignKey
ALTER TABLE `pontoturistico` DROP FOREIGN KEY `PontoTuristico_cidadeId_fkey`;

-- DropIndex
DROP INDEX `Evento_cidadeId_fkey` ON `evento`;

-- DropIndex
DROP INDEX `PontoTuristico_cidadeId_fkey` ON `pontoturistico`;

-- AlterTable
ALTER TABLE `evento` DROP COLUMN `cidadeId`,
    DROP COLUMN `imagemUrl`;

-- AlterTable
ALTER TABLE `pontoturistico` DROP COLUMN `cidadeId`,
    DROP COLUMN `imagemUrl`;

-- DropTable
DROP TABLE `cidade`;
