-- DropForeignKey
ALTER TABLE "CashDrawer" DROP CONSTRAINT "CashDrawer_openedBy_fkey";

-- DropIndex
DROP INDEX "CashDrawer_openedAt_idx";

-- DropIndex
DROP INDEX "CashDrawer_status_idx";

-- AlterTable
ALTER TABLE "CashDrawer" ALTER COLUMN "openedBy" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Pet" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Pet_isArchived_idx" ON "Pet"("isArchived");

-- AddForeignKey
ALTER TABLE "CashDrawer" ADD CONSTRAINT "CashDrawer_openedBy_fkey" FOREIGN KEY ("openedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
