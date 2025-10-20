import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const db = prisma as any

const PROJECT_STATUS_VALUES = ['UPCOMING', 'ONGOING', 'COMPLETED', 'BLOCKED', 'ON_HOLD'] as const

type ProjectStatusType = (typeof PROJECT_STATUS_VALUES)[number]

type UpdateProjectInput = {
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
    return db.projectAccount.create({ data: { name: accountName.trim() } })
  }
  return null
}

async function ensureManager(managerId?: string | null, managerName?: string | null) {
  if (managerId) {
    const existing = await db.projectManager.findUnique({ where: { id: managerId } })
    if (existing) return existing
  }
  if (managerName && managerName.trim().length) {
    const existingByName = await db.projectManager.findFirst({ where: { name: managerName.trim() } })
    if (existingByName) return existingByName
    return db.projectManager.create({ data: { name: managerName.trim() } })
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

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const body = (await _request.json().catch(() => ({}))) as UpdateProjectInput

  const existing = await db.project.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  let accountId = existing.accountId
  let managerId = existing.managerId

  if (body.accountId || body.accountName) {
    const account = await ensureAccount(body.accountId, body.accountName)
    if (!account) {
      return NextResponse.json({ error: 'accountId or accountName must resolve to an account.' }, { status: 400 })
    }
    accountId = account.id
  }

  if (body.managerId || body.managerName) {
    const manager = await ensureManager(body.managerId, body.managerName)
    if (!manager) {
      return NextResponse.json({ error: 'managerId or managerName must resolve to a manager.' }, { status: 400 })
    }
    managerId = manager.id
  }

  const dueDate = parseIsoDate(body.dueDate)

  const updated = await db.project.update({
    where: { id },
    data: {
      name: body.name?.trim() ?? existing.name,
      description: body.description?.trim() ?? existing.description,
      status: body.status ? ensureStatus(body.status) : existing.status,
      progress: body.progress !== undefined ? clampProgress(body.progress) : existing.progress,
      dueDate: body.dueDate !== undefined ? dueDate : existing.dueDate,
      accountId,
      managerId,
    },
    include: {
      account: true,
      manager: true,
    },
  })

  await upsertManagerAccountLink(managerId, accountId)

  return NextResponse.json(serializeProject(updated))
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  await db.project.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
