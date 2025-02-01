-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.

-- Check if TRIPLE_FELINA exists before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'VaccineType') 
    AND enumlabel = 'TRIPLE_FELINA'
  ) THEN
    ALTER TYPE "VaccineType" ADD VALUE 'TRIPLE_FELINA';
  END IF;
END $$;

-- Add LEUCEMIA_FELINA (no check needed if it's new)
ALTER TYPE "VaccineType" ADD VALUE 'LEUCEMIA_FELINA';

-- Add RABIA_FELINA (no check needed if it's new)
ALTER TYPE "VaccineType" ADD VALUE 'RABIA_FELINA';