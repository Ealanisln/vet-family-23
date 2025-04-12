/*
  Warnings:

  - You are about to drop the column `medicalOrderId` on the `MedicalHistory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MedicalHistory" DROP CONSTRAINT "MedicalHistory_medicalOrderId_fkey";

-- DropIndex
DROP INDEX "MedicalHistory_medicalOrderId_idx";

-- DropIndex
DROP INDEX "MedicalHistory_medicalOrderId_key";

-- AlterTable
ALTER TABLE "MedicalHistory" DROP COLUMN "medicalOrderId";
