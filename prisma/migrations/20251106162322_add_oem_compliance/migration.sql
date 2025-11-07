-- CreateEnum
CREATE TYPE "OemComplianceStatus" AS ENUM ('ON_TRACK', 'PENDING', 'AT_RISK');

-- CreateEnum
CREATE TYPE "OemAssignmentStatus" AS ENUM ('EARNED', 'ONGOING', 'PENDING');

-- CreateTable
CREATE TABLE "OemComplianceTrack" (
    "id" TEXT NOT NULL,
    "oem" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "requiredCerts" INTEGER NOT NULL DEFAULT 0,
    "earnedCerts" INTEGER NOT NULL DEFAULT 0,
    "overallRequirement" INTEGER NOT NULL,
    "overallEarned" INTEGER NOT NULL DEFAULT 0,
    "complianceStatus" "OemComplianceStatus" NOT NULL DEFAULT 'PENDING',
    "targetDate" TIMESTAMP(3),
    "roadmapNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OemComplianceTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OemComplianceAssignment" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "engineerId" TEXT NOT NULL,
    "certificationName" TEXT NOT NULL,
    "status" "OemAssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "certificationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OemComplianceAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OemComplianceTrack_oem_idx" ON "OemComplianceTrack"("oem");

-- CreateIndex
CREATE INDEX "OemComplianceTrack_complianceStatus_idx" ON "OemComplianceTrack"("complianceStatus");

-- CreateIndex
CREATE UNIQUE INDEX "OemComplianceTrack_oem_specialization_key" ON "OemComplianceTrack"("oem", "specialization");

-- CreateIndex
CREATE INDEX "OemComplianceAssignment_trackId_idx" ON "OemComplianceAssignment"("trackId");

-- CreateIndex
CREATE INDEX "OemComplianceAssignment_engineerId_idx" ON "OemComplianceAssignment"("engineerId");

-- CreateIndex
CREATE INDEX "OemComplianceAssignment_status_idx" ON "OemComplianceAssignment"("status");

-- CreateIndex
CREATE INDEX "OemComplianceAssignment_certificationId_idx" ON "OemComplianceAssignment"("certificationId");

-- CreateIndex
CREATE UNIQUE INDEX "OemComplianceAssignment_trackId_engineerId_certificationNam_key" ON "OemComplianceAssignment"("trackId", "engineerId", "certificationName");

-- AddForeignKey
ALTER TABLE "OemComplianceAssignment" ADD CONSTRAINT "OemComplianceAssignment_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "OemComplianceTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OemComplianceAssignment" ADD CONSTRAINT "OemComplianceAssignment_engineerId_fkey" FOREIGN KEY ("engineerId") REFERENCES "Engineer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OemComplianceAssignment" ADD CONSTRAINT "OemComplianceAssignment_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "EngineerCertification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
