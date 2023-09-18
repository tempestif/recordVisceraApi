/*
  Warnings:

  - You are about to alter the column `createdAt` on the `bowel_movements` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `bowel_movements` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `checkup` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `checkup` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `checkup_blood` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `checkup_blood` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `checkup_BloodId` on the `checkup_blood_additional` table. All the data in the column will be lost.
  - You are about to alter the column `createdAt` on the `checkup_blood_additional` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `checkup_blood_additional` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `checkup_ct` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `checkup_ct` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `checkup_custom` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `checkup_custom` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `checkup_mri` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `checkup_mri` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `clinic_note` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `clinic_note` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `clinic_report` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `clinic_report` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `daily_report` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `daily_report` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `daily_ReportId` on the `daily_report_abdominal` table. All the data in the column will be lost.
  - You are about to alter the column `createdAt` on the `daily_report_abdominal` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `daily_report_abdominal` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `daily_ReportId` on the `daily_report_arthritis` table. All the data in the column will be lost.
  - You are about to alter the column `createdAt` on the `daily_report_arthritis` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `daily_report_arthritis` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `daily_ReportId` on the `daily_report_condition` table. All the data in the column will be lost.
  - You are about to alter the column `createdAt` on the `daily_report_condition` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `daily_report_condition` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `daily_ReportId` on the `daily_report_ocular_lesions` table. All the data in the column will be lost.
  - You are about to alter the column `createdAt` on the `daily_report_ocular_lesions` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `daily_report_ocular_lesions` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `daily_ReportId` on the `daily_report_skin_lesions` table. All the data in the column will be lost.
  - You are about to alter the column `createdAt` on the `daily_report_skin_lesions` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `daily_report_skin_lesions` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `daily_ReportId` on the `daily_report_stomachache` table. All the data in the column will be lost.
  - You are about to alter the column `createdAt` on the `daily_report_stomachache` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `daily_report_stomachache` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `daily_ReportId` on the `daily_report_temp` table. All the data in the column will be lost.
  - You are about to alter the column `createdAt` on the `daily_report_temp` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `daily_report_temp` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `daily_ReportId` on the `daily_report_weight` table. All the data in the column will be lost.
  - You are about to alter the column `createdAt` on the `daily_report_weight` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `daily_report_weight` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `profiles` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `profiles` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `user_medical_history` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `user_medical_history` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `user_medication_info` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `user_medication_info` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `user_medication_result` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `user_medication_result` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `user_medication_schedule` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `user_medication_schedule` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `user_setting` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `user_setting` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - A unique constraint covering the columns `[dailyReportId]` on the table `daily_report_abdominal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dailyReportId]` on the table `daily_report_arthritis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dailyReportId]` on the table `daily_report_condition` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dailyReportId]` on the table `daily_report_ocular_lesions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dailyReportId]` on the table `daily_report_skin_lesions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dailyReportId]` on the table `daily_report_stomachache` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dailyReportId]` on the table `daily_report_temp` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dailyReportId]` on the table `daily_report_weight` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `checkupBloodId` to the `checkup_blood_additional` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailyReportId` to the `daily_report_abdominal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailyReportId` to the `daily_report_arthritis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailyReportId` to the `daily_report_condition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailyReportId` to the `daily_report_ocular_lesions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailyReportId` to the `daily_report_skin_lesions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailyReportId` to the `daily_report_stomachache` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailyReportId` to the `daily_report_temp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailyReportId` to the `daily_report_weight` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `checkup_blood_additional` DROP FOREIGN KEY `checkup_blood_additional_checkup_BloodId_fkey`;

-- DropForeignKey
ALTER TABLE `daily_report_abdominal` DROP FOREIGN KEY `daily_report_abdominal_daily_ReportId_fkey`;

-- DropForeignKey
ALTER TABLE `daily_report_arthritis` DROP FOREIGN KEY `daily_report_arthritis_daily_ReportId_fkey`;

-- DropForeignKey
ALTER TABLE `daily_report_condition` DROP FOREIGN KEY `daily_report_condition_daily_ReportId_fkey`;

-- DropForeignKey
ALTER TABLE `daily_report_ocular_lesions` DROP FOREIGN KEY `daily_report_ocular_lesions_daily_ReportId_fkey`;

-- DropForeignKey
ALTER TABLE `daily_report_skin_lesions` DROP FOREIGN KEY `daily_report_skin_lesions_daily_ReportId_fkey`;

-- DropForeignKey
ALTER TABLE `daily_report_stomachache` DROP FOREIGN KEY `daily_report_stomachache_daily_ReportId_fkey`;

-- DropForeignKey
ALTER TABLE `daily_report_temp` DROP FOREIGN KEY `daily_report_temp_daily_ReportId_fkey`;

-- DropForeignKey
ALTER TABLE `daily_report_weight` DROP FOREIGN KEY `daily_report_weight_daily_ReportId_fkey`;

-- AlterTable
ALTER TABLE `bowel_movements` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `checkup` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `checkup_blood` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `checkup_blood_additional` DROP COLUMN `checkup_BloodId`,
    ADD COLUMN `checkupBloodId` INTEGER NOT NULL,
    MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `checkup_ct` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `checkup_custom` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `checkup_mri` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `clinic_note` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `clinic_report` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `daily_report` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `daily_report_abdominal` DROP COLUMN `daily_ReportId`,
    ADD COLUMN `dailyReportId` INTEGER NOT NULL,
    MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `daily_report_arthritis` DROP COLUMN `daily_ReportId`,
    ADD COLUMN `dailyReportId` INTEGER NOT NULL,
    MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `daily_report_condition` DROP COLUMN `daily_ReportId`,
    ADD COLUMN `dailyReportId` INTEGER NOT NULL,
    MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `daily_report_ocular_lesions` DROP COLUMN `daily_ReportId`,
    ADD COLUMN `dailyReportId` INTEGER NOT NULL,
    MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `daily_report_skin_lesions` DROP COLUMN `daily_ReportId`,
    ADD COLUMN `dailyReportId` INTEGER NOT NULL,
    MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `daily_report_stomachache` DROP COLUMN `daily_ReportId`,
    ADD COLUMN `dailyReportId` INTEGER NOT NULL,
    MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `daily_report_temp` DROP COLUMN `daily_ReportId`,
    ADD COLUMN `dailyReportId` INTEGER NOT NULL,
    MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `daily_report_weight` DROP COLUMN `daily_ReportId`,
    ADD COLUMN `dailyReportId` INTEGER NOT NULL,
    MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `profiles` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `user_medical_history` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `user_medication_info` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `user_medication_result` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `user_medication_schedule` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `user_setting` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `users` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- CreateIndex
CREATE UNIQUE INDEX `daily_report_abdominal_dailyReportId_key` ON `daily_report_abdominal`(`dailyReportId`);

-- CreateIndex
CREATE UNIQUE INDEX `daily_report_arthritis_dailyReportId_key` ON `daily_report_arthritis`(`dailyReportId`);

-- CreateIndex
CREATE UNIQUE INDEX `daily_report_condition_dailyReportId_key` ON `daily_report_condition`(`dailyReportId`);

-- CreateIndex
CREATE UNIQUE INDEX `daily_report_ocular_lesions_dailyReportId_key` ON `daily_report_ocular_lesions`(`dailyReportId`);

-- CreateIndex
CREATE UNIQUE INDEX `daily_report_skin_lesions_dailyReportId_key` ON `daily_report_skin_lesions`(`dailyReportId`);

-- CreateIndex
CREATE UNIQUE INDEX `daily_report_stomachache_dailyReportId_key` ON `daily_report_stomachache`(`dailyReportId`);

-- CreateIndex
CREATE UNIQUE INDEX `daily_report_temp_dailyReportId_key` ON `daily_report_temp`(`dailyReportId`);

-- CreateIndex
CREATE UNIQUE INDEX `daily_report_weight_dailyReportId_key` ON `daily_report_weight`(`dailyReportId`);

-- AddForeignKey
ALTER TABLE `daily_report_temp` ADD CONSTRAINT `daily_report_temp_dailyReportId_fkey` FOREIGN KEY (`dailyReportId`) REFERENCES `daily_report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_report_weight` ADD CONSTRAINT `daily_report_weight_dailyReportId_fkey` FOREIGN KEY (`dailyReportId`) REFERENCES `daily_report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_report_stomachache` ADD CONSTRAINT `daily_report_stomachache_dailyReportId_fkey` FOREIGN KEY (`dailyReportId`) REFERENCES `daily_report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_report_condition` ADD CONSTRAINT `daily_report_condition_dailyReportId_fkey` FOREIGN KEY (`dailyReportId`) REFERENCES `daily_report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_report_arthritis` ADD CONSTRAINT `daily_report_arthritis_dailyReportId_fkey` FOREIGN KEY (`dailyReportId`) REFERENCES `daily_report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_report_skin_lesions` ADD CONSTRAINT `daily_report_skin_lesions_dailyReportId_fkey` FOREIGN KEY (`dailyReportId`) REFERENCES `daily_report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_report_ocular_lesions` ADD CONSTRAINT `daily_report_ocular_lesions_dailyReportId_fkey` FOREIGN KEY (`dailyReportId`) REFERENCES `daily_report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_report_abdominal` ADD CONSTRAINT `daily_report_abdominal_dailyReportId_fkey` FOREIGN KEY (`dailyReportId`) REFERENCES `daily_report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkup_blood_additional` ADD CONSTRAINT `checkup_blood_additional_checkupBloodId_fkey` FOREIGN KEY (`checkupBloodId`) REFERENCES `checkup_blood`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
