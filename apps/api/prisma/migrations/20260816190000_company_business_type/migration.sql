-- Expand VOLTTA beyond barbershops: company business type
CREATE TYPE "BusinessType" AS ENUM ('BARBERSHOP', 'SALON', 'AESTHETICS');

ALTER TABLE "companies"
  ADD COLUMN "business_type" "BusinessType" NOT NULL DEFAULT 'BARBERSHOP';
