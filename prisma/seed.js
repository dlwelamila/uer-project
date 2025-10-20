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

const PROJECT_ACCOUNTS = [
  { name: 'CRDB', industry: 'Banking', region: 'TZ' },
  { name: 'STANBIC', industry: 'Banking', region: 'TZ' },
  { name: 'IRMICT', industry: 'Government', region: 'TZ' },
  { name: 'NBC', industry: 'Banking', region: 'TZ' },
  { name: 'TRA', industry: 'Government', region: 'TZ' },
  { name: 'TCRA', industry: 'Regulator', region: 'TZ' },
  { name: 'TPDC', industry: 'Energy', region: 'TZ' },
  { name: 'NMB', industry: 'Banking', region: 'TZ' },
  { name: 'TBS', industry: 'Standards', region: 'TZ' },
  { name: 'NEMC', industry: 'Environment', region: 'TZ' },
  { name: 'TANESCO', industry: 'Utilities', region: 'TZ' },
  { name: 'TANF', industry: 'Non-profit', region: 'TZ' },
]

const PROJECT_MANAGERS = [
  { name: 'Derick Lwelamila', email: 'derick@uer.example', phone: '+255-700-000-001' },
  { name: 'Salima Malimba', email: 'salima@uer.example', phone: '+255-700-000-002' },
  { name: 'Dickson Daud', email: 'dickson@uer.example', phone: '+255-700-000-003' },
  { name: 'Johnson M.', email: 'johnson@uer.example', phone: '+255-700-000-004' },
  { name: 'Jason Derul', email: 'jason@uer.example', phone: '+255-700-000-005' },
]

const PROJECT_MANAGER_ACCOUNTS = [
  { manager: 'Derick Lwelamila', account: 'STANBIC' },
  { manager: 'Derick Lwelamila', account: 'CRDB' },
  { manager: 'Derick Lwelamila', account: 'IRMICT' },
  { manager: 'Derick Lwelamila', account: 'NBC' },
  { manager: 'Salima Malimba', account: 'TRA' },
  { manager: 'Salima Malimba', account: 'TCRA' },
  { manager: 'Dickson Daud', account: 'TPDC' },
  { manager: 'Dickson Daud', account: 'NMB' },
  { manager: 'Dickson Daud', account: 'TBS' },
  { manager: 'Johnson M.', account: 'NEMC' },
  { manager: 'Johnson M.', account: 'TANESCO' },
  { manager: 'Jason Derul', account: 'TANF' },
]

const PROJECTS = [
  {
    name: 'HCI Modernisation',
    account: 'CRDB',
    manager: 'Derick Lwelamila',
    status: 'ONGOING',
    progress: 89,
    dueDate: '2025-09-22',
    description: 'Modernise CRDB core infrastructure with new HCI stack.',
  },
  {
    name: 'Exadata Optimisation',
    account: 'TRA',
    manager: 'Salima Malimba',
    status: 'ONGOING',
    progress: 45,
    dueDate: '2025-08-20',
    description: 'Optimise TRA Exadata workloads and licensing.',
  },
  {
    name: 'VXLAN Expansion',
    account: 'TPDC',
    manager: 'Dickson Daud',
    status: 'COMPLETED',
    progress: 100,
    dueDate: '2025-05-11',
    description: 'Completed VXLAN expansion rollout for TPDC sites.',
  },
  {
    name: 'Network Upgrade',
    account: 'NEMC',
    manager: 'Johnson M.',
    status: 'ONGOING',
    progress: 25,
    dueDate: null,
    description: 'Upgrade NEMC network core for resilience.',
  },
  {
    name: 'Cloud Analytics Pilot',
    account: 'STANBIC',
    manager: 'Derick Lwelamila',
    status: 'UPCOMING',
    progress: 5,
    dueDate: '2025-11-15',
    description: 'Pilot analytics workloads in cloud landing zone.',
  },
]

const PROJECT_TASKS = [
  { project: 'HCI Modernisation', title: 'Deploy VxRail cluster', status: 'IN_PROGRESS', dueDate: '2025-05-20' },
  { project: 'HCI Modernisation', title: 'Run performance soak tests', status: 'TODO', dueDate: '2025-06-05' },
  { project: 'HCI Modernisation', title: 'Finalize training plan', status: 'DONE', dueDate: '2025-04-30', completedAt: '2025-04-10' },
  { project: 'Exadata Optimisation', title: 'License assessment', status: 'IN_PROGRESS', dueDate: '2025-05-30' },
  { project: 'Exadata Optimisation', title: 'Patch automation rollout', status: 'TODO', dueDate: '2025-06-18' },
  { project: 'Exadata Optimisation', title: 'Standby testing', status: 'DONE', dueDate: '2025-03-30', completedAt: '2025-03-15' },
  { project: 'VXLAN Expansion', title: 'Handover documentation', status: 'DONE', dueDate: '2025-05-05', completedAt: '2025-05-01' },
  { project: 'VXLAN Expansion', title: 'Post-implementation review', status: 'DONE', dueDate: '2025-05-15', completedAt: '2025-05-12' },
  { project: 'Network Upgrade', title: 'Site survey', status: 'DONE', dueDate: '2025-02-28', completedAt: '2025-02-10' },
  { project: 'Network Upgrade', title: 'Core switch procurement', status: 'IN_PROGRESS', dueDate: '2025-07-05' },
  { project: 'Network Upgrade', title: 'Field engineer scheduling', status: 'TODO', dueDate: '2025-07-20' },
  { project: 'Cloud Analytics Pilot', title: 'Data governance sign-off', status: 'TODO', dueDate: '2025-09-01' },
]

const PROJECT_CASES = [
  { project: 'HCI Modernisation', summary: 'VXLAN expansion follow-up', status: 'PENDING', openedAt: '2025-02-10' },
  { project: 'HCI Modernisation', summary: 'Storage performance review', status: 'OPEN', openedAt: '2025-03-05' },
  { project: 'Exadata Optimisation', summary: 'Backup window breach', status: 'RESOLVED', openedAt: '2025-01-20', resolvedAt: '2025-02-02' },
  { project: 'VXLAN Expansion', summary: 'Change validation', status: 'RESOLVED', openedAt: '2025-04-10', resolvedAt: '2025-04-20' },
  { project: 'Network Upgrade', summary: 'Spare parts delivery delay', status: 'OPEN', openedAt: '2025-03-15' },
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

async function seedProjectData() {
  const accountRecords = {}
  for (const account of PROJECT_ACCOUNTS) {
    accountRecords[account.name] = await prisma.projectAccount.upsert({
      where: { name: account.name },
      update: {
        industry: account.industry ?? null,
        region: account.region ?? null,
      },
      create: {
        name: account.name,
        industry: account.industry ?? null,
        region: account.region ?? null,
      },
    })
  }

  const managerRecords = {}
  for (const manager of PROJECT_MANAGERS) {
    const existingManager = await prisma.projectManager.findFirst({ where: { name: manager.name } })
    if (existingManager) {
      const updatedManager = await prisma.projectManager.update({
        where: { id: existingManager.id },
        data: {
          email: manager.email ?? null,
          phone: manager.phone ?? null,
        },
      })
      managerRecords[manager.name] = updatedManager
    } else {
      managerRecords[manager.name] = await prisma.projectManager.create({
        data: {
          name: manager.name,
          email: manager.email ?? null,
          phone: manager.phone ?? null,
        },
      })
    }
  }

  await prisma.projectManagerAccount.deleteMany({})

  for (const link of PROJECT_MANAGER_ACCOUNTS) {
    const manager = managerRecords[link.manager]
    const account = accountRecords[link.account]
    if (!manager || !account) continue

    await prisma.projectManagerAccount.upsert({
      where: {
        managerId_accountId: {
          managerId: manager.id,
          accountId: account.id,
        },
      },
      update: {},
      create: {
        managerId: manager.id,
        accountId: account.id,
      },
    })
  }

  const projectRecords = {}
  for (const project of PROJECTS) {
    const account = accountRecords[project.account]
    const manager = managerRecords[project.manager]
    if (!account || !manager) continue

    const dueDate = project.dueDate ? new Date(project.dueDate) : null

    projectRecords[project.name] = await prisma.project.upsert({
      where: {
        name_accountId: {
          name: project.name,
          accountId: account.id,
        },
      },
      update: {
        description: project.description ?? null,
        status: project.status,
        progress: project.progress ?? 0,
        dueDate,
        managerId: manager.id,
      },
      create: {
        name: project.name,
        description: project.description ?? null,
        status: project.status,
        progress: project.progress ?? 0,
        dueDate,
        accountId: account.id,
        managerId: manager.id,
      },
    })
  }

  await prisma.projectTask.deleteMany({})
  await prisma.projectCase.deleteMany({})

  for (const task of PROJECT_TASKS) {
    const project = projectRecords[task.project]
    if (!project) continue

    const dueDate = task.dueDate ? new Date(task.dueDate) : null
    const completedAt = task.completedAt ? new Date(task.completedAt) : null

    await prisma.projectTask.upsert({
      where: {
        projectId_title: {
          projectId: project.id,
          title: task.title,
        },
      },
      update: {
        status: task.status,
        dueDate,
        completedAt,
      },
      create: {
        projectId: project.id,
        title: task.title,
        status: task.status,
        dueDate,
        completedAt,
      },
    })
  }

  for (const incident of PROJECT_CASES) {
    const project = projectRecords[incident.project]
    if (!project) continue

    const openedAt = incident.openedAt ? new Date(incident.openedAt) : new Date()
    const resolvedAt = incident.resolvedAt ? new Date(incident.resolvedAt) : null

    await prisma.projectCase.upsert({
      where: {
        projectId_summary: {
          projectId: project.id,
          summary: incident.summary,
        },
      },
      update: {
        status: incident.status,
        openedAt,
        resolvedAt,
      },
      create: {
        projectId: project.id,
        summary: incident.summary,
        status: incident.status,
        openedAt,
        resolvedAt,
      },
    })
  }
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

  await seedProjectData()
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

