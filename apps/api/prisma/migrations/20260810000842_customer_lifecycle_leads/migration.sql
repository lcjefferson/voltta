-- CreateEnum
CREATE TYPE "CustomerLifecycle" AS ENUM ('LEAD', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "CustomerSource" AS ENUM ('WHATSAPP', 'MANUAL', 'BOOKING', 'IMPORT');

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "converted_at" TIMESTAMP(3),
ADD COLUMN     "last_inbound_at" TIMESTAMP(3),
ADD COLUMN     "last_inbound_message" TEXT,
ADD COLUMN     "lifecycle_stage" "CustomerLifecycle" NOT NULL DEFAULT 'CUSTOMER',
ADD COLUMN     "source" "CustomerSource" NOT NULL DEFAULT 'MANUAL';

-- CreateIndex
CREATE INDEX "customers_company_id_lifecycle_stage_idx" ON "customers"("company_id", "lifecycle_stage");
