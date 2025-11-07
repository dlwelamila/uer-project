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

const ENGINEERS = [
  { name: 'Derick Lwelamila', role: 'Systems Engineer' },
  { name: 'Sarah Johnson', role: 'Cloud Architect' },
  { name: 'Johnson M.', role: 'Network Lead' },
  { name: 'Adele Morris', role: 'Virtualization Specialist' },
  { name: 'Sam Patel', role: 'Solutions Consultant' },
]

const ENGINEER_CERTIFICATIONS = [
  {
    engineer: 'Derick Lwelamila',
    certification: 'VxRail Deploy',
    vendor: 'Dell Technologies',
    domain: 'HCI',
    year: 2025,
    expires: '2026-04-01',
    status: 'Active',
    statusDetail: 'Active - renew Apr 2026',
    notExpiring: false,
  },
  {
    engineer: 'Derick Lwelamila',
    certification: 'PowerStore Implementation Engineer',
    vendor: 'Dell Technologies',
    domain: 'Storage',
    year: 2025,
    expires: '2025-11-20',
    status: 'Expires Soon',
    statusDetail: 'Expires Nov 2025',
    notExpiring: false,
  },
  {
    engineer: 'Sarah Johnson',
    certification: 'Azure Solutions Architect Expert',
    vendor: 'Microsoft',
    domain: 'Cloud',
    year: 2024,
    expires: '2026-02-15',
    status: 'Active',
    statusDetail: 'Renew Feb 2026',
    notExpiring: false,
  },
  {
    engineer: 'Johnson M.',
    certification: 'CCNP Enterprise',
    vendor: 'Cisco',
    domain: 'Networking',
    year: 2023,
    expires: '2025-07-01',
    status: 'Expires Soon',
    statusDetail: 'Renew July 2025',
    notExpiring: false,
  },
  {
    engineer: 'Adele Morris',
    certification: 'VMware VCP-DCV',
    vendor: 'VMware',
    domain: 'Virtualization',
    year: 2024,
    expires: '2025-09-30',
    status: 'Active',
    statusDetail: 'Healthy coverage',
    notExpiring: false,
  },
  {
    engineer: 'Sam Patel',
    certification: 'AWS Solutions Architect Professional',
    vendor: 'AWS',
    domain: 'Cloud',
    year: 2023,
    expires: '2025-12-10',
    status: 'Active',
    statusDetail: 'Renew Dec 2025',
    notExpiring: false,
  },
]

const OEM_COMPLIANCE_TRACKS = [
  {
    oem: 'Dell Technologies',
    specialization: 'Storage Deployment',
    requiredCerts: 6,
    overallRequirement: 10,
    targetDate: '2025-12-01',
    complianceStatus: 'PENDING',
    roadmapNotes: 'Focus on PowerStore implementation and storage modernization deliverables.',
  },
  {
    oem: 'Cisco',
    specialization: 'Enterprise Networking',
    requiredCerts: 5,
    overallRequirement: 8,
    targetDate: '2025-09-15',
    complianceStatus: 'AT_RISK',
    roadmapNotes: 'Mitigate CCNP renewals expiring in Q3 and align with network upgrade project.',
  },
  {
    oem: 'Microsoft',
    specialization: 'Cloud Architecture',
    requiredCerts: 4,
    overallRequirement: 6,
    targetDate: '2025-11-30',
    complianceStatus: 'ON_TRACK',
    roadmapNotes: 'Extend Azure Solution Architect coverage and align with hybrid cloud roadmap.',
  },
]

const OEM_COMPLIANCE_ASSIGNMENTS = [
  {
    oem: 'Dell Technologies',
    specialization: 'Storage Deployment',
    engineer: 'Derick Lwelamila',
    certificationName: 'PowerStore Implementation Engineer',
    status: 'EARNED',
    startedAt: '2025-01-10',
    completedAt: '2025-03-18',
    dueAt: '2025-05-01',
    vendor: 'Dell Technologies',
  },
  {
    oem: 'Dell Technologies',
    specialization: 'Storage Deployment',
    engineer: 'Adele Morris',
    certificationName: 'PowerScale Concepts',
    status: 'ONGOING',
    startedAt: '2025-02-05',
    dueAt: '2025-06-10',
    vendor: 'Dell Technologies',
  },
  {
    oem: 'Dell Technologies',
    specialization: 'Storage Deployment',
    engineer: 'Sam Patel',
    certificationName: 'PowerStore Implementation Engineer',
    status: 'PENDING',
    dueAt: '2025-08-01',
    vendor: 'Dell Technologies',
  },
  {
    oem: 'Cisco',
    specialization: 'Enterprise Networking',
    engineer: 'Johnson M.',
    certificationName: 'CCNP Enterprise',
    status: 'ONGOING',
    startedAt: '2025-03-01',
    dueAt: '2025-07-01',
    vendor: 'Cisco',
  },
  {
    oem: 'Cisco',
    specialization: 'Enterprise Networking',
    engineer: 'Sam Patel',
    certificationName: 'Cisco SD-WAN Specialist',
    status: 'PENDING',
    dueAt: '2025-09-30',
    vendor: 'Cisco',
  },
  {
    oem: 'Microsoft',
    specialization: 'Cloud Architecture',
    engineer: 'Sarah Johnson',
    certificationName: 'Azure Solutions Architect Expert',
    status: 'EARNED',
    startedAt: '2024-10-01',
    completedAt: '2025-01-20',
    dueAt: '2025-02-15',
    vendor: 'Microsoft',
  },
  {
    oem: 'Microsoft',
    specialization: 'Cloud Architecture',
    engineer: 'Sam Patel',
    certificationName: 'Azure Administrator Associate',
    status: 'ONGOING',
    startedAt: '2025-01-25',
    dueAt: '2025-05-30',
    vendor: 'Microsoft',
  },
]

const TRAINING_PLANS = [
  {
    engineer: 'Derick Lwelamila',
    vendor: 'Dell Technologies',
    module: 'PowerScale Concepts',
    domain: 'Storage',
    progressPercent: 65,
    timeline: '2 weeks',
    status: 'IN_PROGRESS',
  },
  {
    engineer: 'Johnson M.',
    vendor: 'VMware',
    module: 'vSphere Installation',
    domain: 'Virtualization',
    progressPercent: 30,
    timeline: '4 weeks',
    status: 'IN_PROGRESS',
  },
  {
    engineer: 'Sarah Johnson',
    vendor: 'Microsoft',
    module: 'Azure Fundamentals',
    domain: 'Cloud',
    progressPercent: 100,
    timeline: 'Completed',
    status: 'COMPLETED',
  },
]

const SALES_LEADS = [
  {
    name: 'Alex Johnson',
    company: 'Tech Solutions Inc.',
    email: 'alex.j@company.com',
    phone: '+255-700-111-222',
  manager: 'Wilbard Mkoba',
    status: 'New Lead',
    estimatedValue: 75000,
    probability: 20,
    sector: 'Private Enterprise',
    region: 'Dar es Salaam',
    source: 'Referral',
    notes: 'Initial discovery call complete. Awaiting requirements pack.',
  },
  {
    name: 'Maria Garcia',
    company: 'Enterprise Global',
    email: 'maria.g@enterprise.com',
    phone: '+255-700-333-444',
  manager: 'Irfan Jaffer',
    status: 'Qualified',
    estimatedValue: 150000,
    probability: 50,
    sector: 'FSI (Banking/Insurance)',
    region: 'Dodoma',
    source: 'OEM Partner Lead (Microsoft/Cisco/Huawei/Fortinet)',
    notes: 'Security architecture review pending.',
  },
  {
    name: 'Robert Smith',
    company: 'Innovate Labs',
    email: 'robert.s@innovate.co',
    phone: '+255-700-555-666',
  manager: 'Wilbard Mkoba',
    status: 'Proposal',
    estimatedValue: 200000,
    probability: 80,
    sector: 'Technology',
    region: 'Arusha',
    source: 'LinkedIn / Social',
    notes: 'Proposal sent 10 Oct, waiting for commercial feedback.',
  },
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

async function seedSalesData() {
  for (const lead of SALES_LEADS) {
    await prisma.salesLead.upsert({
      where: {
        name_company: {
          name: lead.name,
          company: lead.company,
        },
      },
      update: {
        email: lead.email ?? null,
        phone: lead.phone ?? null,
        manager: lead.manager ?? null,
        status: lead.status ?? 'New Lead',
        estimatedValue: lead.estimatedValue ?? null,
        probability: lead.probability ?? null,
        sector: lead.sector ?? null,
        region: lead.region ?? null,
        source: lead.source ?? null,
        notes: lead.notes ?? null,
      },
      create: {
        name: lead.name,
        company: lead.company,
        email: lead.email ?? null,
        phone: lead.phone ?? null,
        manager: lead.manager ?? null,
        status: lead.status ?? 'New Lead',
        estimatedValue: lead.estimatedValue ?? null,
        probability: lead.probability ?? null,
        sector: lead.sector ?? null,
        region: lead.region ?? null,
        source: lead.source ?? null,
        notes: lead.notes ?? null,
      },
    })
  }
}

async function seedCompetencyData() {
  const engineerRecords = {}
  for (const engineer of ENGINEERS) {
    engineerRecords[engineer.name] = await prisma.engineer.upsert({
      where: { name: engineer.name },
      update: {
        role: engineer.role ?? null,
      },
      create: {
        name: engineer.name,
        role: engineer.role ?? null,
      },
    })
  }

  const certificationRecords = {}
  for (const cert of ENGINEER_CERTIFICATIONS) {
    const engineer = engineerRecords[cert.engineer]
    if (!engineer) continue

    const expires = cert.expires ? new Date(cert.expires) : null

    const record = await prisma.engineerCertification.upsert({
      where: {
        engineerId_certification_vendor: {
          engineerId: engineer.id,
          certification: cert.certification,
          vendor: cert.vendor,
        },
      },
      update: {
        domain: cert.domain ?? null,
        year: cert.year ?? null,
        expires,
        status: cert.status,
        statusDetail: cert.statusDetail ?? null,
        notExpiring: Boolean(cert.notExpiring),
      },
      create: {
        engineerId: engineer.id,
        certification: cert.certification,
        vendor: cert.vendor,
        domain: cert.domain ?? null,
        year: cert.year ?? null,
        expires,
        status: cert.status,
        statusDetail: cert.statusDetail ?? null,
        notExpiring: Boolean(cert.notExpiring),
      },
    })

    const key = `${engineer.name}::${cert.certification}::${cert.vendor}`
    certificationRecords[key] = record
  }

  const trackEarnedCounts = {}
  for (const assignment of OEM_COMPLIANCE_ASSIGNMENTS) {
    if (assignment.status !== 'EARNED') continue
    const key = `${assignment.oem}::${assignment.specialization}`
    trackEarnedCounts[key] = (trackEarnedCounts[key] ?? 0) + 1
  }

  const trackRecords = {}
  for (const track of OEM_COMPLIANCE_TRACKS) {
    const key = `${track.oem}::${track.specialization}`
    const earned = trackEarnedCounts[key] ?? 0
    const targetDate = track.targetDate ? new Date(track.targetDate) : null
    trackRecords[key] = await prisma.oemComplianceTrack.upsert({
      where: {
        oem_specialization: {
          oem: track.oem,
          specialization: track.specialization,
        },
      },
      update: {
        requiredCerts: track.requiredCerts,
        earnedCerts: earned,
        overallRequirement: track.overallRequirement,
        overallEarned: Math.min(track.overallRequirement, earned),
        complianceStatus: track.complianceStatus,
        targetDate,
        roadmapNotes: track.roadmapNotes ?? null,
      },
      create: {
        oem: track.oem,
        specialization: track.specialization,
        requiredCerts: track.requiredCerts,
        earnedCerts: earned,
        overallRequirement: track.overallRequirement,
        overallEarned: Math.min(track.overallRequirement, earned),
        complianceStatus: track.complianceStatus,
        targetDate,
        roadmapNotes: track.roadmapNotes ?? null,
      },
    })
  }

  for (const assignment of OEM_COMPLIANCE_ASSIGNMENTS) {
    const trackKey = `${assignment.oem}::${assignment.specialization}`
    const track = trackRecords[trackKey]
    const engineer = engineerRecords[assignment.engineer]
    if (!track || !engineer) continue

    const certKey = `${assignment.engineer}::${assignment.certificationName}::${assignment.vendor ?? assignment.oem}`
    const certification = certificationRecords[certKey]

    const startedAt = assignment.startedAt ? new Date(assignment.startedAt) : null
    const completedAt = assignment.completedAt ? new Date(assignment.completedAt) : null
    const dueAt = assignment.dueAt ? new Date(assignment.dueAt) : null

    await prisma.oemComplianceAssignment.upsert({
      where: {
        trackId_engineerId_certificationName: {
          trackId: track.id,
          engineerId: engineer.id,
          certificationName: assignment.certificationName,
        },
      },
      update: {
        status: assignment.status,
        startedAt,
        completedAt,
        dueAt,
        certificationId: certification?.id ?? null,
      },
      create: {
        trackId: track.id,
        engineerId: engineer.id,
        certificationName: assignment.certificationName,
        status: assignment.status,
        startedAt,
        completedAt,
        dueAt,
        certificationId: certification?.id ?? null,
      },
    })
  }

  for (const plan of TRAINING_PLANS) {
    const engineer = engineerRecords[plan.engineer]
    if (!engineer) continue

    await prisma.engineerTraining.upsert({
      where: {
        engineerId_module: {
          engineerId: engineer.id,
          module: plan.module,
        },
      },
      update: {
        vendor: plan.vendor,
        domain: plan.domain ?? null,
        progressPercent: plan.progressPercent,
        timeline: plan.timeline ?? null,
        status: plan.status,
      },
      create: {
        engineerId: engineer.id,
        vendor: plan.vendor,
        module: plan.module,
        domain: plan.domain ?? null,
        progressPercent: plan.progressPercent,
        timeline: plan.timeline ?? null,
        status: plan.status,
      },
    })
  }

  for (const trackKey of Object.keys(trackRecords)) {
    const track = trackRecords[trackKey]
    const aggregates = await prisma.oemComplianceAssignment.groupBy({
      by: ['trackId', 'status'],
      where: { trackId: track.id },
      _count: { _all: true },
    })

    const earnedCount = aggregates
      .filter((row) => row.status === 'EARNED')
      .reduce((total, row) => total + row._count._all, 0)

    await prisma.oemComplianceTrack.update({
      where: { id: track.id },
      data: {
        earnedCerts: earnedCount,
        overallEarned: Math.min(track.overallRequirement, earnedCount),
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
  await seedCompetencyData()
  await seedSalesData()
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

