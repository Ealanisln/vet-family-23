-- CreateEnum
CREATE TYPE "MedicalOrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "MedicalOrder" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "diagnosis" TEXT,
    "treatment" TEXT,
    "prescriptions" TEXT[],
    "notes" TEXT,
    "status" "MedicalOrderStatus" NOT NULL DEFAULT 'PENDING',
    "saleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalOrderProduct" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,

    CONSTRAINT "MedicalOrderProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MedicalOrder_saleId_key" ON "MedicalOrder"("saleId");

-- CreateIndex
CREATE INDEX "MedicalOrder_petId_idx" ON "MedicalOrder"("petId");

-- CreateIndex
CREATE INDEX "MedicalOrder_userId_idx" ON "MedicalOrder"("userId");

-- CreateIndex
CREATE INDEX "MedicalOrder_status_idx" ON "MedicalOrder"("status");

-- CreateIndex
CREATE INDEX "MedicalOrderProduct_orderId_idx" ON "MedicalOrderProduct"("orderId");

-- CreateIndex
CREATE INDEX "MedicalOrderProduct_productId_idx" ON "MedicalOrderProduct"("productId");

-- AddForeignKey
ALTER TABLE "MedicalOrder" ADD CONSTRAINT "MedicalOrder_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalOrder" ADD CONSTRAINT "MedicalOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalOrder" ADD CONSTRAINT "MedicalOrder_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalOrderProduct" ADD CONSTRAINT "MedicalOrderProduct_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "MedicalOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalOrderProduct" ADD CONSTRAINT "MedicalOrderProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
