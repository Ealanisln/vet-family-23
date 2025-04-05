/*
  Warnings:

  - A unique constraint covering the columns `[medicalOrderId]` on the table `MedicalHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MedicalHistory" ADD COLUMN     "medicalOrderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MedicalHistory_medicalOrderId_key" ON "MedicalHistory"("medicalOrderId");

-- CreateIndex
CREATE INDEX "MedicalHistory_medicalOrderId_idx" ON "MedicalHistory"("medicalOrderId");

-- AddForeignKey
ALTER TABLE "MedicalHistory" ADD CONSTRAINT "MedicalHistory_medicalOrderId_fkey" FOREIGN KEY ("medicalOrderId") REFERENCES "MedicalOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
