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
  throw new Error('Invalid tender status')
}

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

function normalizePayload(payload: TenderPayload) {
  const data: Record<string, unknown> = {}

  const name = toNullableString(payload.name)
  if (payload.name !== undefined) data.name = name

  const entity = toNullableString(payload.entity)
  if (payload.entity !== undefined) data.entity = entity

  const status = normalizeStatus(payload.status ?? undefined)
  if (payload.status !== undefined) data.status = status ?? 'ONGOING'

  const submissionDateTime = toNullableDate(payload.submissionDateTime)
  if (payload.submissionDateTime !== undefined) {
    data.submissionDateTime = submissionDateTime
    if (submissionDateTime) {
      data.submissionDate = submissionDateTime
    }
  }

  const submissionDate = toNullableDate(payload.submissionDate)
  if (payload.submissionDate !== undefined && !submissionDateTime) {
    data.submissionDate = submissionDate
  }

  const advertisedDate = toNullableDate(payload.advertisedDate)
  if (payload.advertisedDate !== undefined) {
    data.advertisedDate = advertisedDate
  }

  if (payload.tenderNumber !== undefined) {
    data.tenderNumber = toNullableString(payload.tenderNumber)
  }

  if (payload.value !== undefined) {
    data.value = toNullableInt(payload.value)
  }

  if (payload.owner !== undefined) {
    data.owner = toNullableString(payload.owner)
  }

  if (payload.comment !== undefined) {
    data.comment = toNullableString(payload.comment)
  }

  if (Object.keys(data).length === 0) {
    throw new Error('No changes supplied')
  }

  return data
}

export async function GET(_: Request, { params }: { params: { tenderId: string } }) {
  const tender = await db.tender.findUnique({ where: { id: params.tenderId } })
  if (!tender) {
    return NextResponse.json({ error: 'Tender not found' }, { status: 404 })
  }
  return NextResponse.json(tender)
}

export async function PATCH(request: Request, { params }: { params: { tenderId: string } }) {
  try {
    const payload = (await request.json()) as TenderPayload
    const data = normalizePayload(payload)
    const tender = await db.tender.update({ where: { id: params.tenderId }, data })
    return NextResponse.json(tender)
  } catch (error) {
    if (error instanceof Error && error.message.includes('No changes')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof Error && error.message.includes('Invalid tender status')) {
      return NextResponse.json({ error: error.message }, { status: 422 })
    }
    console.error('Failed to update tender', error)
    return NextResponse.json({ error: 'Failed to update tender' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { tenderId: string } }) {
  try {
    await db.tender.delete({ where: { id: params.tenderId } })
    return NextResponse.json({ ok: true }, { status: 204 })
  } catch (error) {
    console.error('Failed to delete tender', error)
    return NextResponse.json({ error: 'Failed to delete tender' }, { status: 500 })
  }
}
