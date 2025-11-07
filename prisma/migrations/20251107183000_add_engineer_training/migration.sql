-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'NOT_STARTED');

-- CreateTable
CREATE TABLE "EngineerTraining" (
    "id" TEXT NOT NULL,
    "engineerId" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "domain" TEXT,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "timeline" TEXT,
    "status" "TrainingStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EngineerTraining_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EngineerTraining_engineerId_module_key" ON "EngineerTraining"("engineerId", "module");

-- CreateIndex
CREATE INDEX "EngineerTraining_engineerId_idx" ON "EngineerTraining"("engineerId");

-- CreateIndex
CREATE INDEX "EngineerTraining_vendor_idx" ON "EngineerTraining"("vendor");

-- CreateIndex
CREATE INDEX "EngineerTraining_status_idx" ON "EngineerTraining"("status");

-- AddForeignKey
ALTER TABLE "EngineerTraining" ADD CONSTRAINT "EngineerTraining_engineerId_fkey" FOREIGN KEY ("engineerId") REFERENCES "Engineer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
