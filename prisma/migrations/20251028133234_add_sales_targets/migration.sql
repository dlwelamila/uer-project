-- CreateEnum
CREATE TYPE "SalesTargetPeriod" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- AlterTable
ALTER TABLE "SalesLead" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "SalesTarget" (
    "id" TEXT NOT NULL,
    "period" "SalesTargetPeriod" NOT NULL,
    "amount" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesTarget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalesTarget_period_periodStart_idx" ON "SalesTarget"("period", "periodStart");

-- CreateIndex
CREATE INDEX "SalesTarget_period_periodEnd_idx" ON "SalesTarget"("period", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "SalesTarget_period_periodStart_periodEnd_key" ON "SalesTarget"("period", "periodStart", "periodEnd");
