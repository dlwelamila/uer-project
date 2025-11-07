-- CreateTable
CREATE TABLE "SalesLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "manager" TEXT,
    "status" TEXT NOT NULL DEFAULT 'New Lead',
    "estimatedValue" INTEGER,
    "probability" INTEGER,
    "sector" TEXT,
    "region" TEXT,
    "source" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SalesLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalesLead_company_idx" ON "SalesLead"("company");

-- CreateIndex
CREATE INDEX "SalesLead_status_idx" ON "SalesLead"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SalesLead_name_company_key" ON "SalesLead"("name", "company");
