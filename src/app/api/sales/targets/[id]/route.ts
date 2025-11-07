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

function normalizeUpdatePayload(payload: TargetPayload) {
  const data: Record<string, unknown> = {}

  if (payload.period) {
    const period = payload.period.toUpperCase()
    if (!allowedPeriods.has(period)) {
      throw new Error('Target period must be monthly, quarterly, or yearly')
    }
    data.period = period
  }

  if (payload.amount !== undefined) {
    const amountNumber = typeof payload.amount === 'string' ? Number(payload.amount) : payload.amount
    if (amountNumber === null || Number.isNaN(amountNumber)) {
      throw new Error('Target amount must be numeric')
    }
    if (amountNumber < 0) {
      throw new Error('Target amount must be positive')
    }
    data.amount = Math.round(amountNumber)
  }

  if (payload.periodStart !== undefined) {
    const periodStart = parseDate(payload.periodStart)
    if (!periodStart) throw new Error('Valid period start is required')
    data.periodStart = periodStart
  }

  if (payload.periodEnd !== undefined) {
    const periodEnd = parseDate(payload.periodEnd)
    if (!periodEnd) throw new Error('Valid period end is required')
    data.periodEnd = periodEnd
  }

  if ('periodStart' in data && 'periodEnd' in data) {
    if ((data.periodEnd as Date) <= (data.periodStart as Date)) {
      throw new Error('Period end must be after period start')
    }
  }

  return data
}

async function ensureNoOverlap(args: {
  id: string
  period?: string
  periodStart?: Date
  periodEnd?: Date
}) {
  const { id, period, periodStart, periodEnd } = args
  if (!period || !periodStart || !periodEnd) return

  const overlap = await db.salesTarget.findFirst({
    where: {
      period,
      NOT: { id },
      AND: [{ periodStart: { lte: periodEnd } }, { periodEnd: { gte: periodStart } }],
    },
  })

  if (overlap) {
    throw new Error('A target already exists for this timeframe')
  }
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const target = await db.salesTarget.findUnique({ where: { id: params.id } })
  if (!target) {
    return NextResponse.json({ error: 'Target not found' }, { status: 404 })
  }
  return NextResponse.json(target)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  if (!id) {
    return NextResponse.json({ error: 'Target id is required' }, { status: 400 })
  }

  try {
    const payload = (await request.json()) as TargetPayload
    const data = normalizeUpdatePayload(payload)
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 })
    }

    const current = await db.salesTarget.findUnique({ where: { id } })
    if (!current) {
      return NextResponse.json({ error: 'Target not found' }, { status: 404 })
    }

    const period = (data.period as string | undefined) ?? current.period
    const periodStart = (data.periodStart as Date | undefined) ?? new Date(current.periodStart)
    const periodEnd = (data.periodEnd as Date | undefined) ?? new Date(current.periodEnd)

    if (periodEnd <= periodStart) {
      return NextResponse.json({ error: 'Period end must be after period start' }, { status: 400 })
    }

    await ensureNoOverlap({ id, period, periodStart, periodEnd })

    const target = await db.salesTarget.update({ where: { id }, data })
    return NextResponse.json(target)
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message.includes('already exists') ? 409 : 400
      return NextResponse.json({ error: error.message }, { status })
    }
    console.error(`Failed to update sales target ${id}`, error)
    return NextResponse.json({ error: 'Failed to update sales target' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  if (!id) {
    return NextResponse.json({ error: 'Target id is required' }, { status: 400 })
  }

  try {
    await db.salesTarget.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(`Failed to delete sales target ${id}`, error)
    return NextResponse.json({ error: 'Failed to delete sales target' }, { status: 500 })
  }
}
