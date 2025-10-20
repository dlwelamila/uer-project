import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const db = prisma as any

const CASE_STATUS_VALUES = ['OPEN', 'PENDING', 'RESOLVED', 'CLOSED'] as const

type CaseStatusType = (typeof CASE_STATUS_VALUES)[number]

type CaseInput = {
  projectId?: string | null
  summary?: string
  status?: string
  openedAt?: string | null
  resolvedAt?: string | null
}

function ensureStatus(value: string | null | undefined): CaseStatusType {
  if (value && CASE_STATUS_VALUES.includes(value as CaseStatusType)) {
    return value as CaseStatusType
  }
  return 'OPEN'
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

function serializeCase(record: any) {
  return {
    id: record.id,
    projectId: record.projectId,
    summary: record.summary,
    status: record.status,
    openedAt: record.openedAt ? new Date(record.openedAt).toISOString() : null,
    resolvedAt: record.resolvedAt ? new Date(record.resolvedAt).toISOString() : null,
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

  const where: Record<string, unknown> = {}
  if (projectId) where.projectId = projectId

  const cases = await db.projectCase.findMany({
    where,
    include: {
      project: {
        include: { account: true },
      },
    },
    orderBy: [{ openedAt: 'desc' }],
  })

  return NextResponse.json(cases.map(serializeCase))
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CaseInput
  const projectId = body.projectId?.trim()
  const summary = body.summary?.trim()

  if (!projectId || !summary) {
    return NextResponse.json({ error: 'projectId and summary are required.' }, { status: 400 })
  }

  const project = await db.project.findUnique({ where: { id: projectId } })
  if (!project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  const record = await db.projectCase.create({
    data: {
      projectId,
      summary,
      status: ensureStatus(body.status),
      openedAt: parseIsoDate(body.openedAt) ?? new Date(),
      resolvedAt: parseIsoDate(body.resolvedAt),
    },
    include: {
      project: {
        include: { account: true },
      },
    },
  })

  return NextResponse.json(serializeCase(record), { status: 201 })
}
