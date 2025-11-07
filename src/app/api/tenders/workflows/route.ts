import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

const statusCatalog = ['WON', 'LOST', 'ONGOING', 'PENDING', 'SUBMITTED', 'IN_REVIEW'] as const
type TenderStatus = (typeof statusCatalog)[number]

function normalizeStatus(value: unknown): TenderStatus {
  if (typeof value !== 'string') return 'PENDING'
  const trimmed = value.trim()
  if (!trimmed.length) return 'PENDING'
  const normalized = trimmed.toUpperCase().replace(/\s+/g, '_')
  if (statusCatalog.includes(normalized as TenderStatus)) {
    return normalized as TenderStatus
  }
  throw new Error('Invalid workflow status')
}

function toNullableString(value: unknown) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

type WorkflowPayload = {
  tenderId?: string
  stage?: string
  keyTask?: string | null
  timeline?: string | null
  owner?: string | null
  status?: TenderStatus | string | null
  note?: string | null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tenderId = searchParams.get('tenderId')
  const workflows = await db.tenderWorkflowTask.findMany({
    where: tenderId ? { tenderId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      tender: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
  return NextResponse.json(workflows)
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as WorkflowPayload
    const tenderId = toNullableString(payload.tenderId)
    const stage = toNullableString(payload.stage)
    if (!tenderId || !stage) {
      throw new Error('Tender and stage are required')
    }

    const data = {
      tenderId,
      stage,
      keyTask: toNullableString(payload.keyTask),
      timeline: toNullableString(payload.timeline),
      owner: toNullableString(payload.owner),
      status: normalizeStatus(payload.status ?? null),
      note: toNullableString(payload.note),
    }

    const workflow = await db.tenderWorkflowTask.create({ data })
    return NextResponse.json(workflow, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: error.message }, { status: 422 })
    }
    if (error instanceof Error && error.message.includes('Invalid workflow status')) {
      return NextResponse.json({ error: error.message }, { status: 422 })
    }
    console.error('Failed to create workflow entry', error)
    return NextResponse.json({ error: 'Failed to create workflow entry' }, { status: 500 })
  }
}
