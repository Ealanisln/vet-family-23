-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InventoryCategory" ADD VALUE 'LAXATIVES';
ALTER TYPE "InventoryCategory" ADD VALUE 'ANTIDIARRHEAL';
ALTER TYPE "InventoryCategory" ADD VALUE 'ANTIHISTAMINE';
ALTER TYPE "InventoryCategory" ADD VALUE 'MEDICATED_SHAMPOO';
ALTER TYPE "InventoryCategory" ADD VALUE 'CORTICOSTEROIDS';
ALTER TYPE "InventoryCategory" ADD VALUE 'EXPECTORANT';
ALTER TYPE "InventoryCategory" ADD VALUE 'BRONCHODILATOR';
