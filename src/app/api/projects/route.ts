import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const db = prisma as any

const PROJECT_STATUS_VALUES = ['UPCOMING', 'ONGOING', 'COMPLETED', 'BLOCKED', 'ON_HOLD'] as const

type ProjectStatusType = (typeof PROJECT_STATUS_VALUES)[number]

type CreateOrUpdateProjectInput = {
  name?: string
  description?: string | null
  status?: string
  progress?: number
  dueDate?: string | null
  accountId?: string | null
  accountName?: string | null
  managerId?: string | null
  managerName?: string | null
}

function ensureStatus(value: string | null | undefined): ProjectStatusType {
  if (value && PROJECT_STATUS_VALUES.includes(value as ProjectStatusType)) {
    return value as ProjectStatusType
  }
  return 'ONGOING'
}

function clampProgress(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 0
  return Math.min(100, Math.max(0, Math.round(parsed)))
}

function parseIsoDate(value: unknown): Date | null {
  if (!value) return null
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

async function ensureAccount(accountId?: string | null, accountName?: string | null) {
  if (accountId) {
    const existing = await db.projectAccount.findUnique({ where: { id: accountId } })
    if (existing) return existing
  }
  if (accountName && accountName.trim().length) {
    const existingByName = await db.projectAccount.findUnique({ where: { name: accountName.trim() } })
    if (existingByName) return existingByName
    return db.projectAccount.create({
      data: { name: accountName.trim() },
    })
  }
  return null
}

async function ensureManager(managerId?: string | null, managerName?: string | null) {
  if (managerId) {
    const existing = await db.projectManager.findUnique({ where: { id: managerId } })
    if (existing) return existing
  }
  if (managerName && managerName.trim().length) {
    const existingByName = await db.projectManager.findFirst({
      where: { name: managerName.trim() },
    })
    if (existingByName) return existingByName
    return db.projectManager.create({
      data: { name: managerName.trim() },
    })
  }
  return null
}

function serializeProject(record: any) {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    status: record.status,
    progress: record.progress,
    dueDate: record.dueDate ? new Date(record.dueDate).toISOString() : null,
    account: record.account ? { id: record.account.id, name: record.account.name } : null,
    manager: record.manager ? { id: record.manager.id, name: record.manager.name } : null,
    createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : null,
    updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString() : null,
  }
}

async function upsertManagerAccountLink(managerId: string, accountId: string) {
  await db.projectManagerAccount.upsert({
    where: {
      managerId_accountId: {
        managerId,
        accountId,
      },
    },
    update: {},
    create: { managerId, accountId },
  })
}

export async function GET() {
  const items = await db.project.findMany({
    include: {
      account: true,
      manager: true,
    },
    orderBy: [{ createdAt: 'desc' }],
  })

  return NextResponse.json(items.map(serializeProject))
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CreateOrUpdateProjectInput
  const name = body.name?.trim()
  if (!name) {
    return NextResponse.json({ error: 'name is required.' }, { status: 400 })
  }

  const account = await ensureAccount(body.accountId, body.accountName)
  if (!account) {
    return NextResponse.json({ error: 'accountId or accountName is required.' }, { status: 400 })
  }

  const manager = await ensureManager(body.managerId, body.managerName)
  if (!manager) {
    return NextResponse.json({ error: 'managerId or managerName is required.' }, { status: 400 })
  }

  const dueDate = parseIsoDate(body.dueDate)
  const project = await db.project.create({
    data: {
      name,
      description: body.description?.trim() ?? null,
      status: ensureStatus(body.status),
      progress: clampProgress(body.progress),
      dueDate,
      accountId: account.id,
      managerId: manager.id,
    },
    include: {
      account: true,
      manager: true,
    },
  })

  await upsertManagerAccountLink(manager.id, account.id)

  return NextResponse.json(serializeProject(project), { status: 201 })
}
