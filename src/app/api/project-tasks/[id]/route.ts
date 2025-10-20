import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const db = prisma as any

const TASK_STATUS_VALUES = ['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'] as const

type TaskStatusType = (typeof TASK_STATUS_VALUES)[number]

type TaskUpdateInput = {
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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const body = (await request.json().catch(() => ({}))) as TaskUpdateInput

  const existing = await db.projectTask.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Task not found.' }, { status: 404 })
  }

  const updated = await db.projectTask.update({
    where: { id },
    data: {
      title: body.title?.trim() ?? existing.title,
      status: body.status ? ensureStatus(body.status) : existing.status,
      dueDate: body.dueDate !== undefined ? parseIsoDate(body.dueDate) : existing.dueDate,
      completedAt: body.completedAt !== undefined ? parseIsoDate(body.completedAt) : existing.completedAt,
    },
    include: {
      project: {
        include: { account: true },
      },
    },
  })

  return NextResponse.json(serializeTask(updated))
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  await db.projectTask.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
