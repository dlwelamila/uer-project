import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

const statusCatalog = ['WON', 'LOST', 'ONGOING', 'PENDING', 'SUBMITTED', 'IN_REVIEW'] as const
type TenderStatus = (typeof statusCatalog)[number]

const allowedStatuses = new Set<TenderStatus>(statusCatalog)

type TenderPayload = {
  name?: string
  entity?: string
  status?: TenderStatus | string | null
  submissionDate?: string | null
  advertisedDate?: string | null
  submissionDateTime?: string | null
  tenderNumber?: string | null
  value?: number | string | null
  owner?: string | null
  comment?: string | null
}

type NormalizeOptions = {
  requireCoreFields?: boolean
}

function toNullableString(value: unknown) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function toNullableInt(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return Math.round(parsed)
}

function toNullableDate(value: unknown) {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'string') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}

function normalizeStatus(value: unknown): TenderStatus | undefined {
  if (!value) return undefined
  if (typeof value === 'string') {
    const normalized = value.trim().toUpperCase().replace(/\s+/g, '_')
    if (allowedStatuses.has(normalized as TenderStatus)) {
      return normalized as TenderStatus
    }
  }
  if (typeof value === 'object' && value !== null) {
    const asStatus = String(value)
    return normalizeStatus(asStatus)
  }
  throw new Error('Invalid tender status')
}

function normalizePayload(payload: TenderPayload, options: NormalizeOptions = {}) {
  const data: Record<string, unknown> = {}

  const name = toNullableString(payload.name)
  const entity = toNullableString(payload.entity)

  if (options.requireCoreFields) {
    if (!name || !entity) {
      throw new Error('Tender name and procuring entity are required')
    }
  }

  if (name) data.name = name
  if (entity) data.entity = entity

  const status = normalizeStatus(payload.status ?? undefined)
  if (status) {
    data.status = status
  } else if (options.requireCoreFields) {
    data.status = 'ONGOING'
  }

  const submissionDateTime = toNullableDate(payload.submissionDateTime)
  if (submissionDateTime) {
    data.submissionDateTime = submissionDateTime
    data.submissionDate = submissionDateTime
  }

  const submissionDate = toNullableDate(payload.submissionDate)
  if (submissionDate && !submissionDateTime) {
    data.submissionDate = submissionDate
  }

  const advertisedDate = toNullableDate(payload.advertisedDate)
  if (advertisedDate) {
    data.advertisedDate = advertisedDate
  }

  const tenderNumber = toNullableString(payload.tenderNumber)
  if (payload.tenderNumber !== undefined) {
    data.tenderNumber = tenderNumber
  }

  const value = toNullableInt(payload.value)
  if (payload.value !== undefined) {
    data.value = value
  }

  const owner = toNullableString(payload.owner)
  if (payload.owner !== undefined) {
    data.owner = owner
  }

  const comment = toNullableString(payload.comment)
  if (payload.comment !== undefined) {
    data.comment = comment
  }

  if (Object.keys(data).length === 0) {
    throw new Error('No changes supplied')
  }

  return data
}

export async function GET() {
  const tenders = await db.tender.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(tenders)
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TenderPayload
    const data = normalizePayload(payload, { requireCoreFields: true })
    const tender = await db.tender.create({ data })
    return NextResponse.json(tender, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: error.message }, { status: 422 })
    }
    if (error instanceof Error && error.message.includes('No changes')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof Error && error.message.includes('Invalid tender status')) {
      return NextResponse.json({ error: error.message }, { status: 422 })
    }
    console.error('Failed to create tender', error)
    return NextResponse.json({ error: 'Failed to create tender' }, { status: 500 })
  }
}
