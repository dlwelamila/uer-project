import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const db = prisma as any

const TASK_STATUS_VALUES = ['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'] as const

type TaskStatusType = (typeof TASK_STATUS_VALUES)[number]

type TaskInput = {
  projectId?: string | null
  title?: string
  status?: string
  dueDate?: string | null
  completedAt?: string | null
}

function ensureStatus(value: string | null | undefined): TaskStatusType {
  if (value && TASK_STATUS_VALUES.includes(value as TaskStatusType)) {
    return value as TaskStatusType
  }
  return 'TODO'
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

function serializeTask(record: any) {
  return {
    id: record.id,
    projectId: record.projectId,
    title: record.title,
    status: record.status,
    dueDate: record.dueDate ? new Date(record.dueDate).toISOString() : null,
    completedAt: record.completedAt ? new Date(record.completedAt).toISOString() : null,
    project: record.project
      ? {
          id: record.project.id,
          name: record.project.name,
          account: record.project.account ? { id: record.project.account.id, name: record.project.account.name } : null,
        }
      : null,
    createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : null,
    updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString() : null,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId') ?? undefined
  const accountId = searchParams.get('accountId') ?? undefined

  const where: Record<string, unknown> = {}
  if (projectId) where.projectId = projectId
  if (accountId) where.project = { accountId }

  const tasks = await db.projectTask.findMany({
    where,
    include: {
      project: {
        include: { account: true },
      },
    },
    orderBy: [{ createdAt: 'desc' }],
  })

  return NextResponse.json(tasks.map(serializeTask))
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as TaskInput
  const projectId = body.projectId?.trim()
  const title = body.title?.trim()

  if (!projectId || !title) {
    return NextResponse.json({ error: 'projectId and title are required.' }, { status: 400 })
  }

  const project = await db.project.findUnique({ where: { id: projectId } })
  if (!project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  const task = await db.projectTask.create({
    data: {
      projectId,
      title,
      status: ensureStatus(body.status),
      dueDate: parseIsoDate(body.dueDate),
      completedAt: parseIsoDate(body.completedAt),
    },
    include: {
      project: {
        include: { account: true },
      },
    },
  })

  return NextResponse.json(serializeTask(task), { status: 201 })
}
