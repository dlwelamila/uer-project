import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

type HistoryPayload = {
  year?: number | string
  total?: number | string
  won?: number | string
  lost?: number | string
  ongoing?: number | string
  valueWon?: number | string
}

function toPositiveInt(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return Math.max(0, Math.round(parsed))
}

function serializeHistoryRecord(record: {
  id: string
  year: number
  total: number
  won: number
  lost: number
  ongoing: number
  valueWon: unknown
  createdAt: Date
  updatedAt: Date
}) {
  return {
    ...record,
    valueWon: Number(record.valueWon ?? 0),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    source: 'manual' as const,
  }
}

function normalizePayload(payload: HistoryPayload) {
  const data: Record<string, unknown> = {}

  if (payload.year !== undefined) {
    const parsed = toPositiveInt(payload.year)
    if (parsed === null) throw new Error('Year must be a number')
    data.year = parsed
  }
  if (payload.total !== undefined) {
    const parsed = toPositiveInt(payload.total)
    if (parsed === null) throw new Error('Total tenders must be numeric')
    data.total = parsed
  }
  if (payload.won !== undefined) {
    const parsed = toPositiveInt(payload.won)
    if (parsed === null) throw new Error('Won tenders must be numeric')
    data.won = parsed
  }
  if (payload.lost !== undefined) {
    const parsed = toPositiveInt(payload.lost)
    if (parsed === null) throw new Error('Lost tenders must be numeric')
    data.lost = parsed
  }
  if (payload.ongoing !== undefined) {
    const parsed = toPositiveInt(payload.ongoing)
    if (parsed === null) throw new Error('Ongoing tenders must be numeric')
    data.ongoing = parsed
  }
  if (payload.valueWon !== undefined) {
    const parsed = toPositiveInt(payload.valueWon)
    if (parsed === null) throw new Error('Won value must be numeric')
    data.valueWon = parsed
  }

  if (Object.keys(data).length === 0) {
    throw new Error('No changes supplied')
  }

  return data
}

export async function PATCH(request: Request, { params }: { params: { historyId: string } }) {
  try {
    const payload = (await request.json()) as HistoryPayload
    const data = normalizePayload(payload)
    const record = await db.tenderHistory.update({ where: { id: params.historyId }, data })
    return NextResponse.json(serializeHistoryRecord(record))
  } catch (error) {
    if (error instanceof Error && error.message.includes('No changes')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof Error && error.message.includes('numeric')) {
      return NextResponse.json({ error: error.message }, { status: 422 })
    }
    if (error instanceof Error && error.message.includes('Year must')) {
      return NextResponse.json({ error: error.message }, { status: 422 })
    }
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return NextResponse.json({ error: 'A history record for that year already exists.' }, { status: 409 })
    }
    console.error('Failed to update history entry', error)
    return NextResponse.json({ error: 'Failed to update history entry' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { historyId: string } }) {
  try {
    await db.tenderHistory.delete({ where: { id: params.historyId } })
    return NextResponse.json({ ok: true }, { status: 204 })
  } catch (error) {
    console.error('Failed to delete history entry', error)
    return NextResponse.json({ error: 'Failed to delete history entry' }, { status: 500 })
  }
}
