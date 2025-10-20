import { prisma } from './prisma'

type ProjectStatusType = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'BLOCKED' | 'ON_HOLD'
type ProjectTaskStatusType = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'
type ProjectCaseStatusType = 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED'

type ProjectRecord = {
  id: string
  name: string
  description: string | null
  status: ProjectStatusType
  progress: number
  dueDate: Date | null
  accountId: string
  managerId: string
  account?: { id: string; name: string }
  manager?: { id: string; name: string }
}

type ProjectTaskRecord = {
  id: string
  projectId: string
  title: string
  status: ProjectTaskStatusType
  dueDate: Date | null
  completedAt: Date | null
  project?: { id: string; name: string; account?: { id: string; name: string } }
}

type ProjectCaseRecord = {
  id: string
  projectId: string
  summary: string
  status: ProjectCaseStatusType
  openedAt: Date
  resolvedAt: Date | null
  project?: { id: string; name: string; account?: { id: string; name: string } }
}

type ProjectManagerAccountRecord = {
  id: string
  managerId: string
  accountId: string
  manager?: { id: string; name: string }
  account?: { id: string; name: string }
}

type ProjectAccountRecord = {
  id: string
  name: string
}

type ProjectManagerRecord = {
  id: string
  name: string
}

const PROJECT_STATUS_VALUES: ProjectStatusType[] = ['UPCOMING', 'ONGOING', 'COMPLETED', 'BLOCKED', 'ON_HOLD']
const PROJECT_TASK_STATUS_VALUES: ProjectTaskStatusType[] = ['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED']
const PROJECT_CASE_STATUS_VALUES: ProjectCaseStatusType[] = ['OPEN', 'PENDING', 'RESOLVED', 'CLOSED']

const db = prisma as any

export type ProjectDashboardSummaryCard = {
  key: string
  title: string
  value: string
  description: string
  color: 'sky' | 'emerald' | 'cyan' | 'fuchsia'
  sub: string
}

export type ProjectPipelineRow = {
  id: string
  managerName: string
  accountName: string
  projectName: string
  progress: number
  status: ProjectStatusType
  dueDate: string | null
  dueDateLabel: string
  description: string | null
}

export type ProjectAccountHealthRow = {
  accountId: string
  accountName: string
  completed: number
  ongoing: number
  upcoming: number
}

export type ProjectTaskDetail = {
  id: string
  projectId: string
  projectName: string
  title: string
  status: ProjectTaskStatusType
  dueDate: string | null
  completedAt: string | null
}

export type ProjectTaskPipelineRow = {
  accountId: string
  accountName: string
  scope: number
  ongoing: number
  completed: number
  nextTimeline: string | null
  tasks: ProjectTaskDetail[]
}

export type ProjectManagerCoverageRow = {
  managerId: string
  managerName: string
  managedAccounts: number
  accounts: string[]
}

export type ProjectDashboardData = {
  summaryCards: ProjectDashboardSummaryCard[]
  pipeline: ProjectPipelineRow[]
  accountHealth: ProjectAccountHealthRow[]
  taskPipeline: ProjectTaskPipelineRow[]
  managerCoverage: ProjectManagerCoverageRow[]
  lookups: {
    accounts: { id: string; name: string }[]
    managers: { id: string; name: string }[]
    projectStatuses: { value: ProjectStatusType; label: string }[]
    taskStatuses: { value: ProjectTaskStatusType; label: string }[]
    caseStatuses: { value: ProjectCaseStatusType; label: string }[]
  }
}

function formatDateLabel(value: Date | null): string {
  if (!value) return 'TBD'
  return value.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null
}

function statusLabel(status: ProjectStatusType): string {
  switch (status) {
    case 'COMPLETED':
      return 'completed'
    case 'UPCOMING':
      return 'upcoming'
    case 'BLOCKED':
      return 'pending'
    case 'ON_HOLD':
      return 'scheduled'
    default:
      return 'ongoing'
  }
}

export async function getProjectsDashboardData(): Promise<ProjectDashboardData> {
  const [projects, tasks, cases, managerLinks, accounts, managers] = await Promise.all([
    db.project.findMany({
      include: {
        account: true,
        manager: true,
      },
      orderBy: [{ createdAt: 'asc' }],
    }) as Promise<ProjectRecord[]>,
    db.projectTask.findMany({
      include: {
        project: {
          include: { account: true },
        },
      },
    }) as Promise<ProjectTaskRecord[]>,
    db.projectCase.findMany({
      include: {
        project: {
          include: { account: true },
        },
      },
    }) as Promise<ProjectCaseRecord[]>,
    db.projectManagerAccount.findMany({
      include: {
        manager: true,
        account: true,
      },
    }) as Promise<ProjectManagerAccountRecord[]>,
    db.projectAccount.findMany({ orderBy: { name: 'asc' } }) as Promise<ProjectAccountRecord[]>,
    db.projectManager.findMany({ orderBy: { name: 'asc' } }) as Promise<ProjectManagerRecord[]>,
  ])

  const totalAccounts = accounts.length
  const managerCount = managers.length

  const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length
  const ongoingProjects = projects.filter((p) => p.status === 'ONGOING').length
  const upcomingProjects = projects.filter((p) => p.status === 'UPCOMING').length

  const openCases = cases.filter((c) => c.status === 'OPEN').length
  const pendingCases = cases.filter((c) => c.status === 'PENDING').length
  const resolvedCases = cases.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length

  const completedTasks = tasks.filter((t) => t.status === 'DONE').length
  const totalTasks = tasks.length
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  const summaryCards: ProjectDashboardSummaryCard[] = [
    {
      key: 'accounts',
      title: 'Total Accounts',
      value: String(totalAccounts),
      description: `Managed by ${managerCount} account manager${managerCount === 1 ? '' : 's'}`,
      color: 'sky',
      sub: 'Active this FY',
    },
    {
      key: 'projects',
      title: 'Active Projects',
      value: String(completedProjects + ongoingProjects + upcomingProjects),
      description: `${completedProjects} completed / ${ongoingProjects} ongoing / ${upcomingProjects} upcoming`,
      color: 'emerald',
      sub: 'Across accounts',
    },
    {
      key: 'cases',
      title: 'Open Cases',
      value: String(openCases + pendingCases),
      description: `${resolvedCases} resolved / ${pendingCases + openCases} pending follow-ups`,
      color: 'cyan',
      sub: 'Follow-ups needed',
    },
    {
      key: 'tasks',
      title: 'Tasks Completed',
      value: `${completionRate}%`,
      description: `${completedTasks} of ${totalTasks} project tasks closed`,
      color: 'fuchsia',
      sub: 'Percent complete',
    },
  ]

  const pipeline: ProjectPipelineRow[] = projects.map((project) => ({
    id: project.id,
    managerName: project.manager?.name ?? 'Unassigned',
    accountName: project.account?.name ?? 'Unassigned',
    projectName: project.name,
    progress: project.progress ?? 0,
    status: project.status,
    dueDate: toIso(project.dueDate),
    dueDateLabel: formatDateLabel(project.dueDate),
    description: project.description,
  }))

  const accountStatusMap = new Map<string, ProjectAccountHealthRow>()
  for (const project of projects) {
    const key = project.accountId
    if (!accountStatusMap.has(key)) {
      accountStatusMap.set(key, {
        accountId: key,
        accountName: project.account?.name ?? 'Unassigned',
        completed: 0,
        ongoing: 0,
        upcoming: 0,
      })
    }
    const record = accountStatusMap.get(key)!
    if (project.status === 'COMPLETED') {
      record.completed += 1
    } else if (project.status === 'UPCOMING') {
      record.upcoming += 1
    } else {
      record.ongoing += 1
    }
  }

  // Ensure accounts without projects still appear
  for (const account of accounts) {
    if (!accountStatusMap.has(account.id)) {
      accountStatusMap.set(account.id, {
        accountId: account.id,
        accountName: account.name,
        completed: 0,
        ongoing: 0,
        upcoming: 0,
      })
    }
  }

  const accountHealth = Array.from(accountStatusMap.values()).sort((a, b) => a.accountName.localeCompare(b.accountName))

  const tasksByAccount = new Map<string, ProjectTaskPipelineRow>()
  for (const task of tasks) {
    const account = task.project?.account
    if (!account) continue
    if (!tasksByAccount.has(account.id)) {
      tasksByAccount.set(account.id, {
        accountId: account.id,
        accountName: account.name,
        scope: 0,
        ongoing: 0,
        completed: 0,
        nextTimeline: null,
        tasks: [],
      })
    }

    const record = tasksByAccount.get(account.id)!
    record.scope += 1
    if (task.status === 'DONE') {
      record.completed += 1
    } else if (task.status === 'IN_PROGRESS') {
      record.ongoing += 1
    }

    if (task.dueDate) {
      const currentNext = record.nextTimeline ? new Date(record.nextTimeline) : null
      if (!currentNext || task.dueDate < currentNext) {
        record.nextTimeline = task.dueDate.toISOString()
      }
    }

    record.tasks.push({
      id: task.id,
      projectId: task.projectId,
      projectName: task.project?.name ?? 'Unassigned',
      title: task.title,
      status: task.status,
      dueDate: toIso(task.dueDate),
      completedAt: toIso(task.completedAt),
    })
  }

  const taskPipeline = Array.from(tasksByAccount.values())
    .map((row) => ({
      ...row,
      nextTimeline: row.nextTimeline ? formatDateLabel(new Date(row.nextTimeline)) : null,
    }))
    .sort((a, b) => a.accountName.localeCompare(b.accountName))

  const coverageMap = new Map<string, { managerId: string; managerName: string; accounts: Set<string> }>()
  for (const manager of managers) {
    coverageMap.set(manager.id, { managerId: manager.id, managerName: manager.name, accounts: new Set() })
  }

  for (const link of managerLinks) {
    const entry = coverageMap.get(link.managerId)
    if (entry && link.account) {
      entry.accounts.add(link.account.name)
    }
  }

  // Fallback to projects in case explicit links are missing
  for (const project of projects) {
    const entry = coverageMap.get(project.managerId)
    if (entry && project.account) {
      entry.accounts.add(project.account.name)
    }
  }

  const managerCoverage: ProjectManagerCoverageRow[] = Array.from(coverageMap.values())
    .map((entry) => ({
      managerId: entry.managerId,
      managerName: entry.managerName,
      managedAccounts: entry.accounts.size,
      accounts: Array.from(entry.accounts).sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.managerName.localeCompare(b.managerName))

  return {
    summaryCards,
    pipeline,
    accountHealth,
    taskPipeline,
    managerCoverage,
    lookups: {
      accounts: accounts.map((account) => ({ id: account.id, name: account.name })),
      managers: managers.map((manager) => ({ id: manager.id, name: manager.name })),
      projectStatuses: PROJECT_STATUS_VALUES.map((value) => ({ value, label: statusLabel(value) })),
      taskStatuses: PROJECT_TASK_STATUS_VALUES.map((value) => ({
        value,
        label:
          value === 'DONE'
            ? 'completed'
            : value === 'IN_PROGRESS'
            ? 'ongoing'
            : value === 'BLOCKED'
            ? 'blocked'
            : 'planned',
      })),
      caseStatuses: PROJECT_CASE_STATUS_VALUES.map((value) => ({
        value,
        label:
          value === 'RESOLVED'
            ? 'resolved'
            : value === 'OPEN'
            ? 'open'
            : value === 'CLOSED'
            ? 'closed'
            : 'pending',
      })),
    },
  }
}
