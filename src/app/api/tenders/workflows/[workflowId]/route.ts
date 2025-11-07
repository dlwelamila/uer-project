import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

const statusCatalog = ['WON', 'LOST', 'ONGOING', 'PENDING', 'SUBMITTED', 'IN_REVIEW'] as const
type TenderStatus = (typeof statusCatalog)[number]

function toNullableString(value: unknown) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function normalizeStatus(value: unknown): TenderStatus | undefined {
  if (!value) return undefined
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed.length) return undefined
    const normalized = trimmed.toUpperCase().replace(/\s+/g, '_')
    if (statusCatalog.includes(normalized as TenderStatus)) {
      return normalized as TenderStatus
    }
  }
  if (typeof value === 'object' && value !== null) {
    const asStatus = String(value)
    return normalizeStatus(asStatus)
  }
  throw new Error('Invalid workflow status')
}

type WorkflowPayload = {
  stage?: string
  keyTask?: string | null
  timeline?: string | null
  owner?: string | null
  status?: TenderStatus | string | null
  note?: string | null
}

function normalizePayload(payload: WorkflowPayload) {
  const data: Record<string, unknown> = {}

  if (payload.stage !== undefined) {
    data.stage = toNullableString(payload.stage)
  }
  if (payload.keyTask !== undefined) {
    data.keyTask = toNullableString(payload.keyTask)
  }
  if (payload.timeline !== undefined) {
    data.timeline = toNullableString(payload.timeline)
  }
  if (payload.owner !== undefined) {
    data.owner = toNullableString(payload.owner)
  }
  if (payload.note !== undefined) {
    data.note = toNullableString(payload.note)
  }
  if (payload.status !== undefined) {
    data.status = normalizeStatus(payload.status) ?? 'PENDING'
  }

  if (Object.keys(data).length === 0) {
    throw new Error('No changes supplied')
  }

  return data
}

export async function PATCH(request: Request, { params }: { params: { workflowId: string } }) {
  try {
    const payload = (await request.json()) as WorkflowPayload
    const data = normalizePayload(payload)
    const workflow = await db.tenderWorkflowTask.update({
      where: { id: params.workflowId },
      data,
    })
    return NextResponse.json(workflow)
  } catch (error) {
    if (error instanceof Error && error.message.includes('No changes')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof Error && error.message.includes('Invalid workflow status')) {
      return NextResponse.json({ error: error.message }, { status: 422 })
    }
    console.error('Failed to update workflow entry', error)
    return NextResponse.json({ error: 'Failed to update workflow entry' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { workflowId: string } }) {
  try {
    await db.tenderWorkflowTask.delete({ where: { id: params.workflowId } })
    return NextResponse.json({ ok: true }, { status: 204 })
  } catch (error) {
    console.error('Failed to delete workflow entry', error)
    return NextResponse.json({ error: 'Failed to delete workflow entry' }, { status: 500 })
  }
}
