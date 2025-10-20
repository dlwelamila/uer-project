import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const db = prisma as any

const CASE_STATUS_VALUES = ['OPEN', 'PENDING', 'RESOLVED', 'CLOSED'] as const

type CaseStatusType = (typeof CASE_STATUS_VALUES)[number]

type CaseUpdateInput = {
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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const body = (await request.json().catch(() => ({}))) as CaseUpdateInput

  const existing = await db.projectCase.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Case not found.' }, { status: 404 })
  }

  const updated = await db.projectCase.update({
    where: { id },
    data: {
      summary: body.summary?.trim() ?? existing.summary,
      status: body.status ? ensureStatus(body.status) : existing.status,
      openedAt: body.openedAt !== undefined ? parseIsoDate(body.openedAt) ?? existing.openedAt : existing.openedAt,
      resolvedAt: body.resolvedAt !== undefined ? parseIsoDate(body.resolvedAt) : existing.resolvedAt,
    },
    include: {
      project: {
        include: { account: true },
      },
    },
  })

  return NextResponse.json(serializeCase(updated))
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  await db.projectCase.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
