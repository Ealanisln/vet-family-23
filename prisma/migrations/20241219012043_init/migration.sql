-- CreateEnum
CREATE TYPE "VaccineType" AS ENUM ('DP_PUPPY', 'DHPPI', 'DHPPI_L', 'DHPPI_RL', 'BORDETELLA', 'SEXTUPLE', 'SEXTUPLE_R', 'RABIES');

-- CreateEnum
CREATE TYPE "VaccinationStatus" AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "VaccinationStage" AS ENUM ('PUPPY', 'ADULT');

-- CreateEnum
CREATE TYPE "InventoryCategory" AS ENUM ('MEDICINE', 'SURGICAL_MATERIAL', 'VACCINE', 'FOOD', 'ACCESSORY', 'CONSUMABLE');

-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT', 'RETURN', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "kindeId" TEXT NOT NULL,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "preferredContactMethod" TEXT,
    "pet" TEXT,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "nextVisitFree" BOOLEAN NOT NULL DEFAULT false,
    "lastVisit" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cost" DOUBLE PRECISION NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VisitHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "internalId" TEXT,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "microchipNumber" TEXT,
    "isNeutered" BOOLEAN NOT NULL DEFAULT false,
    "isDeceased" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalHistory" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "reasonForVisit" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "treatment" TEXT NOT NULL,
    "prescriptions" TEXT[],
    "notes" TEXT,

    CONSTRAINT "MedicalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vaccination" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "vaccineType" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "administrationDate" TIMESTAMP(3) NOT NULL,
    "nextDoseDate" TIMESTAMP(3) NOT NULL,
    "batchNumber" TEXT,
    "manufacturer" TEXT,
    "veterinarianName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vaccination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaccinationSchedule" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "vaccineType" "VaccineType" NOT NULL,
    "stage" "VaccinationStage" NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" "VaccinationStatus" NOT NULL DEFAULT 'PENDING',
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaccinationSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Billing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "petId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "services" TEXT[],
    "cost" DOUBLE PRECISION NOT NULL,
    "paymentStatus" TEXT NOT NULL,

    CONSTRAINT "Billing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "reminderType" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "contactInformation" TEXT NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "InventoryCategory" NOT NULL,
    "description" TEXT,
    "activeCompound" TEXT,
    "presentation" TEXT,
    "measure" TEXT,
    "brand" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER,
    "location" TEXT,
    "expirationDate" TIMESTAMP(3),
    "status" "InventoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "batchNumber" TEXT,
    "specialNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "userId" TEXT NOT NULL,
    "relatedRecordId" TEXT,
    "notes" TEXT,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_kindeId_key" ON "User"("kindeId");

-- CreateIndex
CREATE INDEX "User_firstName_lastName_phone_idx" ON "User"("firstName", "lastName", "phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_key_key" ON "Role"("key");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE INDEX "Vaccination_petId_vaccineType_idx" ON "Vaccination"("petId", "vaccineType");

-- CreateIndex
CREATE INDEX "Vaccination_nextDoseDate_status_idx" ON "Vaccination"("nextDoseDate", "status");

-- CreateIndex
CREATE INDEX "VaccinationSchedule_petId_scheduledDate_status_idx" ON "VaccinationSchedule"("petId", "scheduledDate", "status");

-- CreateIndex
CREATE INDEX "InventoryItem_category_idx" ON "InventoryItem"("category");

-- CreateIndex
CREATE INDEX "InventoryItem_name_idx" ON "InventoryItem"("name");

-- CreateIndex
CREATE INDEX "InventoryItem_status_idx" ON "InventoryItem"("status");

-- CreateIndex
CREATE INDEX "InventoryItem_expirationDate_idx" ON "InventoryItem"("expirationDate");

-- CreateIndex
CREATE INDEX "InventoryMovement_itemId_date_idx" ON "InventoryMovement"("itemId", "date");

-- CreateIndex
CREATE INDEX "InventoryMovement_userId_idx" ON "InventoryMovement"("userId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitHistory" ADD CONSTRAINT "VisitHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalHistory" ADD CONSTRAINT "MedicalHistory_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccination" ADD CONSTRAINT "Vaccination_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccinationSchedule" ADD CONSTRAINT "VaccinationSchedule_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Billing" ADD CONSTRAINT "Billing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Billing" ADD CONSTRAINT "Billing_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
