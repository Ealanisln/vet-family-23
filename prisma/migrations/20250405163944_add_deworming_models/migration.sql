-- CreateEnum
CREATE TYPE "DewormingType" AS ENUM ('INTERNAL', 'EXTERNAL', 'BOTH');

-- CreateEnum
CREATE TYPE "DewormingStage" AS ENUM ('PUPPY', 'ADULT');

-- CreateEnum
CREATE TYPE "DewormingStatus" AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE', 'SCHEDULED');

-- CreateTable
CREATE TABLE "Deworming" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "dewormingType" "DewormingType" NOT NULL,
    "stage" "DewormingStage" NOT NULL,
    "status" "DewormingStatus" NOT NULL DEFAULT 'PENDING',
    "administrationDate" TIMESTAMP(3) NOT NULL,
    "nextDoseDate" TIMESTAMP(3) NOT NULL,
    "batchNumber" TEXT,
    "manufacturer" TEXT,
    "veterinarianName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deworming_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DewormingSchedule" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "dewormingType" "DewormingType" NOT NULL,
    "stage" "DewormingStage" NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" "DewormingStatus" NOT NULL DEFAULT 'PENDING',
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DewormingSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Deworming_petId_dewormingType_idx" ON "Deworming"("petId", "dewormingType");

-- CreateIndex
CREATE INDEX "Deworming_nextDoseDate_status_idx" ON "Deworming"("nextDoseDate", "status");

-- CreateIndex
CREATE INDEX "DewormingSchedule_petId_scheduledDate_status_idx" ON "DewormingSchedule"("petId", "scheduledDate", "status");

-- AddForeignKey
ALTER TABLE "Deworming" ADD CONSTRAINT "Deworming_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DewormingSchedule" ADD CONSTRAINT "DewormingSchedule_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
