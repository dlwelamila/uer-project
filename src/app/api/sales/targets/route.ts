import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

const allowedPeriods = new Set(['MONTHLY', 'QUARTERLY', 'YEARLY'])

type TargetPayload = {
  period?: string
  amount?: number | string
  periodStart?: string
  periodEnd?: string
}

function parseDate(value: unknown) {
  if (!value || typeof value !== 'string') return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

function normalizePayload(payload: TargetPayload) {
  const period = typeof payload.period === 'string' ? payload.period.toUpperCase() : ''
  if (!allowedPeriods.has(period)) {
    throw new Error('Target period must be monthly, quarterly, or yearly')
  }

  const amountNumber = typeof payload.amount === 'string' ? Number(payload.amount) : payload.amount
  if (amountNumber === undefined || amountNumber === null || Number.isNaN(amountNumber)) {
    throw new Error('Target amount is required')
  }
  if (amountNumber < 0) {
    throw new Error('Target amount must be positive')
  }

  const periodStart = parseDate(payload.periodStart)
  const periodEnd = parseDate(payload.periodEnd)
  if (!periodStart || !periodEnd) {
    throw new Error('Valid period start and end dates are required')
  }
  if (periodEnd <= periodStart) {
    throw new Error('Period end must be after period start')
  }

  return {
    period,
    amount: Math.round(amountNumber),
    periodStart,
    periodEnd,
  }
}

async function ensureNoOverlap(args: {
  period: string
  periodStart: Date
  periodEnd: Date
  excludeId?: string
}) {
  const { period, periodStart, periodEnd, excludeId } = args
  const overlap = await db.salesTarget.findFirst({
    where: {
      period,
      NOT: excludeId ? { id: excludeId } : undefined,
      AND: [{ periodStart: { lte: periodEnd } }, { periodEnd: { gte: periodStart } }],
    },
  })

  if (overlap) {
    throw new Error('A target already exists for this timeframe')
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period')?.toUpperCase()
  const active = searchParams.get('active')
  const where: Record<string, unknown> = {}

  if (period && allowedPeriods.has(period)) {
    where.period = period
  }

  if (active === 'true') {
    const now = new Date()
    where.AND = [{ periodStart: { lte: now } }, { periodEnd: { gte: now } }]
  }

  const targets = await db.salesTarget.findMany({
    where,
    orderBy: [{ period: 'asc' }, { periodStart: 'desc' }],
  })

  return NextResponse.json(targets)
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TargetPayload
    const data = normalizePayload(payload)
    await ensureNoOverlap(data)

    const target = await db.salesTarget.create({ data })
    return NextResponse.json(target, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message.includes('already exists') ? 409 : 400
      return NextResponse.json({ error: error.message }, { status })
    }
    console.error('Failed to create sales target', error)
    return NextResponse.json({ error: 'Failed to create sales target' }, { status: 500 })
  }
}
