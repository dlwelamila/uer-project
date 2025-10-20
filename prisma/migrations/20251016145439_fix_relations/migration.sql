-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Environment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Environment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Engagement" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',

    CONSTRAINT "Engagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "medium" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "attendees" TEXT,
    "notes" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "sessionId" TEXT,
    "sectionKey" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "takenAt" TIMESTAMP(3),
    "takenBy" TEXT,
    "environment" TEXT,
    "redaction" TEXT,
    "extra" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extraction" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "rawText" TEXT,
    "parsedValue" TEXT,
    "confidence" DOUBLE PRECISION,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "Extraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "author" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductFamily" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ProductFamily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,

    CONSTRAINT "ProductModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "System" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "serial" TEXT,
    "installedCode" TEXT,
    "status" TEXT,
    "environmentId" TEXT,
    "modelId" TEXT,

    CONSTRAINT "System_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "systemId" TEXT,
    "severity" INTEGER NOT NULL,
    "channel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "systemId" TEXT,
    "codeLevel" TEXT,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Open',
    "impact" TEXT,
    "resolution" TEXT,
    "recommendation" TEXT,
    "createdTs" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedTs" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SparePartEvent" (
    "id" TEXT NOT NULL,
    "systemId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "srNumber" TEXT,
    "partType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "mode" TEXT,
    "status" TEXT,

    CONSTRAINT "SparePartEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelStat" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "percent" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ChannelStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolumePoint" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "VolumePoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gateway" (
    "id" TEXT NOT NULL,
    "gatewayId" TEXT NOT NULL,
    "model" TEXT,
    "version" TEXT,
    "connectedDevices" INTEGER NOT NULL DEFAULT 0,
    "lastContact" TIMESTAMP(3),
    "registered" TIMESTAMP(3),
    "clusterId" TEXT,
    "clusterName" TEXT,

    CONSTRAINT "Gateway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodePolicyTrack" (
    "id" TEXT NOT NULL,
    "systemModel" TEXT NOT NULL,
    "assetCount" INTEGER NOT NULL DEFAULT 0,
    "x7Min" TEXT,
    "x7Rec" TEXT,
    "x7Latest" TEXT,
    "x8Min" TEXT,
    "x8Rec" TEXT,
    "x8Latest" TEXT,
    "installed" TEXT,
    "marker" TEXT,

    CONSTRAINT "CodePolicyTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "product" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3) NOT NULL,
    "statusBucket" TEXT NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "probDU" TEXT,
    "owner" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "due" TEXT,
    "mitigation" TEXT,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionItem" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "due" TEXT,
    "notes" TEXT,

    CONSTRAINT "ActionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "phone" TEXT,
    "email" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFamily_name_key" ON "ProductFamily"("name");

-- AddForeignKey
ALTER TABLE "Environment" ADD CONSTRAINT "Environment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Extraction" ADD CONSTRAINT "Extraction_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductModel" ADD CONSTRAINT "ProductModel_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "ProductFamily"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "System" ADD CONSTRAINT "System_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "System" ADD CONSTRAINT "System_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ProductModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "System"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "System"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparePartEvent" ADD CONSTRAINT "SparePartEvent_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "System"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelStat" ADD CONSTRAINT "ChannelStat_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolumePoint" ADD CONSTRAINT "VolumePoint_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
