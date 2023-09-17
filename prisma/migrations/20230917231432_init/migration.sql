/*
  Warnings:

  - You are about to alter the column `createdAt` on the `Daily_report_Condition` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `Daily_report_Condition` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `Daily_report_Weight` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `Daily_report_Weight` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `User_Medication_Schedule` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `User_Medication_Schedule` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `blood_checkup` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `blood_checkup` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `bowel_movements` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `bowel_movements` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `checkup` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `checkup` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `clinic_report` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `clinic_report` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `daily_report` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `daily_report` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `profiles` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `profiles` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `user_medical_history` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `user_medical_history` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `user_setting` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `user_setting` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the `Additional_Blood_Checkup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Clinic_Note` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ct_Checkup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Custom_Checkup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Daily_report_Abdominal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Daily_report_Arthritis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Daily_report_OcularLesitions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Daily_report_SkinLesions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Daily_report_Stomachache` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Daily_report_Temp` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Medication_Timing_Types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mri_Checkup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User_Medication_Info` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User_Medication_Result` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Additional_Blood_Checkup` DROP FOREIGN KEY `Additional_Blood_Checkup_blood_CheckupId_fkey`;

-- DropForeignKey
ALTER TABLE `Clinic_Note` DROP FOREIGN KEY `Clinic_Note_clinicReportId_fkey`;

-- DropForeignKey
ALTER TABLE `Ct_Checkup` DROP FOREIGN KEY `Ct_Checkup_checkupId_fkey`;

-- DropForeignKey
ALTER TABLE `Custom_Checkup` DROP FOREIGN KEY `Custom_Checkup_checkupId_fkey`;

-- DropForeignKey
ALTER TABLE `Daily_report_Abdominal` DROP FOREIGN KEY `Daily_report_Abdominal_daily_ReportId_fkey`;

-- DropForeignKey
ALTER TABLE `Daily_report_Arthritis` DROP FOREIGN KEY `Daily_report_Arthritis_daily_ReportId_fkey`;

-- DropForeignKey
ALTER TABLE `Daily_report_OcularLesitions` DROP FOREIGN KEY `Daily_report_OcularLesitions_daily_ReportId_fkey`;

-- DropForeignKey
ALTER TABLE `Daily_report_SkinLesions` DROP FOREIGN KEY `Daily_report_SkinLesions_daily_ReportId_fkey`;

-- DropForeignKey
ALTER TABLE `Daily_report_Stomachache` DROP FOREIGN KEY `Daily_report_Stomachache_daily_ReportId_fkey`;

-- DropForeignKey
ALTER TABLE `Daily_report_Stomachache` DROP FOREIGN KEY `Daily_report_Stomachache_result_fkey`;

-- DropForeignKey
ALTER TABLE `Daily_report_Temp` DROP FOREIGN KEY `Daily_report_Temp_daily_ReportId_fkey`;

-- DropForeignKey
ALTER TABLE `Mri_Checkup` DROP FOREIGN KEY `Mri_Checkup_checkupId_fkey`;

-- DropForeignKey
ALTER TABLE `User_Medication_Info` DROP FOREIGN KEY `User_Medication_Info_userId_fkey`;

-- DropForeignKey
ALTER TABLE `User_Medication_Result` DROP FOREIGN KEY `User_Medication_Result_medicationInfoId_fkey`;

-- DropForeignKey
ALTER TABLE `User_Medication_Result` DROP FOREIGN KEY `User_Medication_Result_userId_fkey`;

-- DropForeignKey
ALTER TABLE `User_Medication_Schedule` DROP FOREIGN KEY `User_Medication_Schedule_medicationInfoId_fkey`;

-- DropForeignKey
ALTER TABLE `User_Medication_Schedule` DROP FOREIGN KEY `User_Medication_Schedule_timing_fkey`;

-- AlterTable
ALTER TABLE `Daily_report_Condition` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `Daily_report_Weight` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `User_Medication_Schedule` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `blood_checkup` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `bowel_movements` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `checkup` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `clinic_report` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `daily_report` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `profiles` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `user_medical_history` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `user_setting` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `users` MODIFY `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- DropTable
DROP TABLE `Additional_Blood_Checkup`;

-- DropTable
DROP TABLE `Clinic_Note`;

-- DropTable
DROP TABLE `Ct_Checkup`;

-- DropTable
DROP TABLE `Custom_Checkup`;

-- DropTable
DROP TABLE `Daily_report_Abdominal`;

-- DropTable
DROP TABLE `Daily_report_Arthritis`;

-- DropTable
DROP TABLE `Daily_report_OcularLesitions`;

-- DropTable
DROP TABLE `Daily_report_SkinLesions`;

-- DropTable
DROP TABLE `Daily_report_Stomachache`;

-- DropTable
DROP TABLE `Daily_report_Temp`;

-- DropTable
DROP TABLE `Medication_Timing_Types`;

-- DropTable
DROP TABLE `Mri_Checkup`;

-- DropTable
DROP TABLE `User_Medication_Info`;

-- DropTable
DROP TABLE `User_Medication_Result`;

-- CreateTable
CREATE TABLE `daily_report_temp` (
    `result` DOUBLE NOT NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `daily_ReportId` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `daily_report_temp_daily_ReportId_key`(`daily_ReportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_report_stomachache` (
    `result` INTEGER NOT NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `daily_ReportId` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `daily_report_stomachache_daily_ReportId_key`(`daily_ReportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_report_arthritis` (
    `result` INTEGER NOT NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `daily_ReportId` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `daily_report_arthritis_daily_ReportId_key`(`daily_ReportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_report_skin_lesions` (
    `result` INTEGER NOT NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `daily_ReportId` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `daily_report_skin_lesions_daily_ReportId_key`(`daily_ReportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_report_ocular_lesions` (
    `result` INTEGER NOT NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `daily_ReportId` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `daily_report_ocular_lesions_daily_ReportId_key`(`daily_ReportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_report_abdominal` (
    `result` INTEGER NOT NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `daily_ReportId` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `daily_report_abdominal_daily_ReportId_key`(`daily_ReportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `additional_blood_checkup` (
    `itemName` VARCHAR(191) NOT NULL,
    `result` VARCHAR(191) NULL,
    `unit` VARCHAR(191) NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `blood_CheckupId` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mri_checkup` (
    `result` VARCHAR(191) NOT NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `checkupId` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `mri_checkup_checkupId_key`(`checkupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ct_checkup` (
    `result` VARCHAR(191) NOT NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `checkupId` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `ct_checkup_checkupId_key`(`checkupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `custom_checkup` (
    `checkupName` VARCHAR(191) NOT NULL,
    `result` VARCHAR(191) NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `checkupId` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `custom_checkup_checkupId_key`(`checkupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinic_note` (
    `note` VARCHAR(191) NOT NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clinicReportId` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    UNIQUE INDEX `clinic_note_clinicReportId_key`(`clinicReportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_medication_info` (
    `name` VARCHAR(191) NOT NULL,
    `count` DOUBLE NOT NULL,
    `dosage` DOUBLE NOT NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medication_timing_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `typeName` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `medication_timing_types_typeName_key`(`typeName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_medication_result` (
    `day` DATE NOT NULL,
    `time` TIME NOT NULL,
    `medicationInfoId` INTEGER NOT NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT NOW(),
    `updatedAt` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `daily_report_temp` ADD CONSTRAINT `daily_report_temp_daily_ReportId_fkey` FOREIGN KEY (`daily_ReportId`) REFERENCES `daily_report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_report_stomachache` ADD CONSTRAINT `daily_report_stomachache_result_fkey` FOREIGN KEY (`result`) REFERENCES `stomachache_scale_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_report_stomachache` ADD CONSTRAINT `daily_report_stomachache_daily_ReportId_fkey` FOREIGN KEY (`daily_ReportId`) REFERENCES `daily_report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_report_arthritis` ADD CONSTRAINT `daily_report_arthritis_daily_ReportId_fkey` FOREIGN KEY (`daily_ReportId`) REFERENCES `daily_report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_report_skin_lesions` ADD CONSTRAINT `daily_report_skin_lesions_daily_ReportId_fkey` FOREIGN KEY (`daily_ReportId`) REFERENCES `daily_report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_report_ocular_lesions` ADD CONSTRAINT `daily_report_ocular_lesions_daily_ReportId_fkey` FOREIGN KEY (`daily_ReportId`) REFERENCES `daily_report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_report_abdominal` ADD CONSTRAINT `daily_report_abdominal_daily_ReportId_fkey` FOREIGN KEY (`daily_ReportId`) REFERENCES `daily_report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `additional_blood_checkup` ADD CONSTRAINT `additional_blood_checkup_blood_CheckupId_fkey` FOREIGN KEY (`blood_CheckupId`) REFERENCES `blood_checkup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mri_checkup` ADD CONSTRAINT `mri_checkup_checkupId_fkey` FOREIGN KEY (`checkupId`) REFERENCES `checkup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ct_checkup` ADD CONSTRAINT `ct_checkup_checkupId_fkey` FOREIGN KEY (`checkupId`) REFERENCES `checkup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `custom_checkup` ADD CONSTRAINT `custom_checkup_checkupId_fkey` FOREIGN KEY (`checkupId`) REFERENCES `checkup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinic_note` ADD CONSTRAINT `clinic_note_clinicReportId_fkey` FOREIGN KEY (`clinicReportId`) REFERENCES `clinic_report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_medication_info` ADD CONSTRAINT `user_medication_info_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User_Medication_Schedule` ADD CONSTRAINT `User_Medication_Schedule_timing_fkey` FOREIGN KEY (`timing`) REFERENCES `medication_timing_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User_Medication_Schedule` ADD CONSTRAINT `User_Medication_Schedule_medicationInfoId_fkey` FOREIGN KEY (`medicationInfoId`) REFERENCES `user_medication_info`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_medication_result` ADD CONSTRAINT `user_medication_result_medicationInfoId_fkey` FOREIGN KEY (`medicationInfoId`) REFERENCES `user_medication_info`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_medication_result` ADD CONSTRAINT `user_medication_result_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
