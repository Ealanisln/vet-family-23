-- Add unique constraint to Pet.internalId
-- Note: This constraint allows NULL values but ensures uniqueness for non-NULL values
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_internalId_key" UNIQUE ("internalId");

-- Create composite index for better query performance
CREATE INDEX "Pet_userId_isArchived_idx" ON "Pet"("userId", "isArchived"); 