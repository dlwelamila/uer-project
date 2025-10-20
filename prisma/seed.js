import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CUSTOMERS = [
  {
    name: 'CRDB BANK PLC',
    engagements: [
      {
        type: 'monthly',
        periodStart: '2024-01-01',
        periodEnd: '2024-01-31',
        status: 'Published',
      },
      {
        type: 'quarterly',
        periodStart: '2024-01-01',
        periodEnd: '2024-03-31',
        status: 'Draft',
      },
      {
        type: 'annual',
        periodStart: '2024-01-01',
        periodEnd: '2024-12-31',
        status: 'Draft',
      },
    ],
  },
  {
    name: 'NMB BANK PLC',
    engagements: [
      {
        type: 'monthly',
        periodStart: '2024-02-01',
        periodEnd: '2024-02-29',
        status: 'Draft',
      },
      {
        type: 'quarterly',
        periodStart: '2024-04-01',
        periodEnd: '2024-06-30',
        status: 'Draft',
      },
    ],
  },
  {
    name: 'STANBIC BANK PLC',
    engagements: [
      {
        type: 'monthly',
        periodStart: '2024-03-01',
        periodEnd: '2024-03-31',
        status: 'Draft',
      },
      {
        type: 'annual',
        periodStart: '2023-01-01',
        periodEnd: '2023-12-31',
        status: 'Published',
      },
    ],
  },
]

const DEFAULT_VOLUME = [27, 18, 11, 9, 3, 6, 11, 5, 5, 7, 1, 13]
const DEFAULT_CHANNELS = [
  { channel: 'Dial-Home', percent: 38 },
  { channel: 'Web', percent: 56 },
  { channel: 'Phone', percent: 2 },
  { channel: 'Connect Home', percent: 2 },
  { channel: 'Chat', percent: 1 },
  { channel: 'Email', percent: 1 },
]
const DEFAULT_SEVERITY = [
  { severity: 'S1', percent: 2 },
  { severity: 'S2', percent: 52 },
  { severity: 'S3', percent: 32 },
  { severity: 'S5', percent: 14 },
]

async function ensureEnvironment(organizationId, name = 'HQ') {
  const existing = await prisma.environment.findFirst({
    where: { organizationId, name },
  })
  if (existing) return existing

  return prisma.environment.create({
    data: { name, organizationId },
  })
}

async function seedEngagement(orgId, engagementConfig) {
  const periodStart = new Date(engagementConfig.periodStart)
  const periodEnd = new Date(engagementConfig.periodEnd)

  const existing = await prisma.engagement.findFirst({
    where: {
      organizationId: orgId,
      type: engagementConfig.type,
      periodStart,
      periodEnd,
    },
  })

  if (existing) {
    return existing
  }

  return prisma.engagement.create({
    data: {
      organizationId: orgId,
      type: engagementConfig.type,
      periodStart,
      periodEnd,
      status: engagementConfig.status ?? 'Draft',
    },
  })
}

async function seedSummaryData(engagementId) {
  await prisma.channelStat.deleteMany({ where: { engagementId } })
  await prisma.channelStat.createMany({
    data: DEFAULT_CHANNELS.map((row) => ({
      engagementId,
      channel: row.channel,
      percent: row.percent,
    })),
  })

  await prisma.note.deleteMany({
    where: {
      engagementId,
      sectionKey: { in: ['dashboard.topProducts', 'dashboard.severity'] },
    },
  })

  await prisma.note.create({
    data: {
      engagementId,
      sectionKey: 'dashboard.topProducts',
      text: JSON.stringify([
        { product: 'VxRail P570F', count: 45, percent: 39.8 },
        { product: 'Networker', count: 21, percent: 18.5 },
        { product: 'VxRail P670F', count: 14, percent: 12.3 },
        { product: 'Dell EMC Unity XT 480', count: 9, percent: 7.9 },
        { product: 'DD6400 Appliance', count: 8, percent: 7.0 },
        { product: 'Dell EMC Unity 500', count: 6, percent: 5.3 },
        { product: 'Others', count: 10, percent: 8.8 },
      ]),
    },
  })

  await prisma.note.create({
    data: {
      engagementId,
      sectionKey: 'dashboard.severity',
      text: JSON.stringify(DEFAULT_SEVERITY),
    },
  })

  await prisma.volumePoint.deleteMany({ where: { engagementId } })
  await prisma.volumePoint.createMany({
    data: DEFAULT_VOLUME.map((value, index) => ({
      engagementId,
      year: 2024,
      month: index + 1,
      value,
    })),
  })
}

async function main() {
  for (const customer of CUSTOMERS) {
    const organization = await prisma.organization.upsert({
      where: { name: customer.name },
      update: {},
      create: { name: customer.name },
    })

    await ensureEnvironment(organization.id, 'HQ')

    for (const engagementConfig of customer.engagements) {
      const engagement = await seedEngagement(organization.id, engagementConfig)
      await seedSummaryData(engagement.id)
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })

