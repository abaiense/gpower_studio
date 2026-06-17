-- CreateEnum
CREATE TYPE "FlashSlotStatus" AS ENUM ('OPEN', 'CLAIMED', 'EXPIRED', 'CANCELLED');

-- AlterTable: Add payment fields
ALTER TABLE "payments"
  ADD COLUMN "source" TEXT,
  ADD COLUMN "installments" INTEGER,
  ADD COLUMN "installmentValue" DOUBLE PRECISION,
  ADD COLUMN "checkoutUrl" TEXT;

-- AlterTable: Add MercadoPago config to studios
ALTER TABLE "studios"
  ADD COLUMN "mpAccessToken" TEXT,
  ADD COLUMN "mpPublicKey" TEXT;

-- CreateTable: flash_slots
CREATE TABLE "flash_slots" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "originalPrice" DOUBLE PRECISION NOT NULL,
    "discountPrice" DOUBLE PRECISION NOT NULL,
    "sessionAt" TIMESTAMP(3) NOT NULL,
    "claimDeadline" TIMESTAMP(3) NOT NULL,
    "status" "FlashSlotStatus" NOT NULL DEFAULT 'OPEN',
    "claimToken" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "claimedByClientId" TEXT,
    "claimedAt" TIMESTAMP(3),
    "appointmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flash_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flash_slots_claimToken_key" ON "flash_slots"("claimToken");

-- CreateIndex
CREATE UNIQUE INDEX "flash_slots_appointmentId_key" ON "flash_slots"("appointmentId");

-- CreateIndex
CREATE INDEX "flash_slots_studioId_idx" ON "flash_slots"("studioId");

-- CreateIndex
CREATE INDEX "flash_slots_claimToken_idx" ON "flash_slots"("claimToken");

-- CreateIndex
CREATE INDEX "flash_slots_status_idx" ON "flash_slots"("status");

-- AddForeignKey
ALTER TABLE "flash_slots" ADD CONSTRAINT "flash_slots_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flash_slots" ADD CONSTRAINT "flash_slots_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flash_slots" ADD CONSTRAINT "flash_slots_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flash_slots" ADD CONSTRAINT "flash_slots_claimedByClientId_fkey" FOREIGN KEY ("claimedByClientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flash_slots" ADD CONSTRAINT "flash_slots_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
