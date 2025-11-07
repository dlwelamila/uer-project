-- CreateTable
CREATE TABLE "Engineer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Engineer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngineerCertification" (
    "id" TEXT NOT NULL,
    "engineerId" TEXT NOT NULL,
    "certification" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "domain" TEXT,
    "year" INTEGER,
    "expires" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "statusDetail" TEXT,
    "notExpiring" BOOLEAN NOT NULL DEFAULT false,
    "attachmentPath" TEXT,
    "attachmentName" TEXT,
    "attachmentMime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngineerCertification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Engineer_name_key" ON "Engineer"("name");

-- CreateIndex
CREATE INDEX "EngineerCertification_engineerId_idx" ON "EngineerCertification"("engineerId");

-- CreateIndex
CREATE INDEX "EngineerCertification_vendor_idx" ON "EngineerCertification"("vendor");

-- CreateIndex
CREATE UNIQUE INDEX "EngineerCertification_engineerId_certification_vendor_key" ON "EngineerCertification"("engineerId", "certification", "vendor");

-- AddForeignKey
ALTER TABLE "EngineerCertification" ADD CONSTRAINT "EngineerCertification_engineerId_fkey" FOREIGN KEY ("engineerId") REFERENCES "Engineer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
