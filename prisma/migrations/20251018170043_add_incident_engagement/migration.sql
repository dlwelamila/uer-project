-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "engagementId" TEXT,
ADD COLUMN     "sn" TEXT,
ADD COLUMN     "srNumber" TEXT;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
