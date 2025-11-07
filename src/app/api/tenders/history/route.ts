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

type HistoryRecord = {
  id: string
  year: number
  total: number
  won: number
  lost: number
  ongoing: number
  valueWon: number
  createdAt: string
  updatedAt: string
  source: 'manual' | 'derived'
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
}): HistoryRecord {
  return {
    ...record,
    valueWon: Number(record.valueWon ?? 0),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    source: 'manual',
  }
}

function mergeHistory(manualRecords: HistoryRecord[], derivedRecords: HistoryRecord[]) {
  const byYear = new Map<number, HistoryRecord>()
  derivedRecords.forEach((record) => {
    if (record.total > 0) {
      byYear.set(record.year, record)
    }
  })
  manualRecords.forEach((record) => {
    byYear.set(record.year, record)
  })
  return Array.from(byYear.values()).sort((a, b) => b.year - a.year)
}

async function buildDerivedHistory(): Promise<HistoryRecord[]> {
  const tenders = (await db.tender.findMany({
    select: {
      submissionDate: true,
      submissionDateTime: true,
      createdAt: true,
      status: true,
      value: true,
    },
  })) as Array<{
    submissionDate: string | Date | null
    submissionDateTime: string | Date | null
    createdAt: string | Date
    status: string
    value: number | null
  }>

  const byYear = new Map<number, HistoryRecord>()

  const ensureRecord = (year: number) => {
    const existing = byYear.get(year)
    if (existing) return existing
    const placeholder: HistoryRecord = {
      id: `derived-${year}`,
      year,
      total: 0,
      won: 0,
      lost: 0,
      ongoing: 0,
      valueWon: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'derived',
    }
    byYear.set(year, placeholder)
    return placeholder
  }

  tenders.forEach((tender) => {
    const rawDate = tender.submissionDate ?? tender.submissionDateTime ?? tender.createdAt
    if (!rawDate) return
    const date = new Date(rawDate)
    if (Number.isNaN(date.getTime())) return
    const year = date.getFullYear()
    const record = ensureRecord(year)
    record.total += 1
    switch (String(tender.status).toUpperCase()) {
      case 'WON':
        record.won += 1
        if (typeof tender.value === 'number' && Number.isFinite(tender.value)) {
          record.valueWon += tender.value
        }
        break
      case 'LOST':
        record.lost += 1
        break
      default:
        record.ongoing += 1
        break
    }
  })

  return Array.from(byYear.values())
}

export async function GET() {
  const [manualHistory, derivedHistory] = await Promise.all([
    db.tenderHistory.findMany({
      orderBy: { year: 'desc' },
    }),
    buildDerivedHistory(),
  ])

  const manualRecords = (manualHistory as Array<{
    id: string
    year: number
    total: number
    won: number
    lost: number
    ongoing: number
    valueWon: unknown
    createdAt: Date
    updatedAt: Date
  }>).map(serializeHistoryRecord)

  const records = mergeHistory(manualRecords, derivedHistory)
  return NextResponse.json(records)
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as HistoryPayload
    const year = toPositiveInt(payload.year)
    const total = toPositiveInt(payload.total)
    const won = toPositiveInt(payload.won)
    const lost = toPositiveInt(payload.lost)
    const ongoing = toPositiveInt(payload.ongoing)
    const valueWon = toPositiveInt(payload.valueWon)

    if (year === null || total === null || won === null || lost === null || ongoing === null || valueWon === null) {
      throw new Error('All history fields are required')
    }

    const record = await db.tenderHistory.create({
      data: { year, total, won, lost, ongoing, valueWon },
    })

  return NextResponse.json(serializeHistoryRecord(record), { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: error.message }, { status: 422 })
    }
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return NextResponse.json({ error: 'A history record for that year already exists.' }, { status: 409 })
    }
    console.error('Failed to create history entry', error)
    return NextResponse.json({ error: 'Failed to create history entry' }, { status: 500 })
  }
}
