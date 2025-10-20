import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function computePeriodBounds(type: string, periodStartISO: string, periodEndISO?: string) {
  const startInput = new Date(periodStartISO)
  if (Number.isNaN(startInput.getTime())) {
    throw new Error('Invalid periodStart')
  }
  const start = new Date(Date.UTC(startInput.getUTCFullYear(), startInput.getUTCMonth(), 1))

  let end: Date
  if (periodEndISO) {
    const endInput = new Date(periodEndISO)
    if (Number.isNaN(endInput.getTime())) {
      throw new Error('Invalid periodEnd')
    }
    end = new Date(Date.UTC(endInput.getUTCFullYear(), endInput.getUTCMonth() + 1, 0))
  } else {
    const year = start.getUTCFullYear()
    const monthIndex = start.getUTCMonth()
    if (type === 'annual') {
      end = new Date(Date.UTC(year + 1, 0, 0))
    } else if (type === 'quarterly') {
      const quarterStartMonth = Math.floor(monthIndex / 3) * 3
      end = new Date(Date.UTC(year, quarterStartMonth + 3, 0))
    } else {
      end = new Date(Date.UTC(year, monthIndex + 1, 0))
    }
  }

  if (end < start) {
    end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0))
  }

  return { start, end }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const organizationId = searchParams.get('organizationId') ?? undefined
  const type = searchParams.get('type') ?? undefined
  const status = searchParams.get('status') ?? undefined

  const where: {
    organizationId?: string
    type?: string
    status?: string
  } = {}

  if (organizationId) where.organizationId = organizationId
  if (type) where.type = type
  if (status) where.status = status

  const rows = await prisma.engagement.findMany({
    where,
    select: {
      id: true,
      type: true,
      periodStart: true,
      periodEnd: true,
      status: true,
      organizationId: true,
      organization: { select: { name: true } },
    },
    orderBy: [{ periodStart: 'desc' }],
  })

  return NextResponse.json(
    rows.map((row) => ({
      id: row.id,
      type: row.type,
      periodStart: row.periodStart,
      periodEnd: row.periodEnd,
      status: row.status,
      organizationId: row.organizationId,
      organizationName: row.organization?.name ?? null,
    }))
  )
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { organizationId, type, periodStart, periodEnd, status = 'Draft' } = body || {}

  if (!organizationId || !type || !periodStart) {
    return NextResponse.json({ error: 'organizationId, type and periodStart are required.' }, { status: 400 })
  }

  let bounds
  try {
    bounds = computePeriodBounds(type, periodStart, periodEnd)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid periodStart provided.' }, { status: 400 })
  }

  const existing = await prisma.engagement.findFirst({
    where: {
      organizationId,
      type,
      periodStart: bounds.start,
      periodEnd: bounds.end,
    },
  })

  const engagement =
    existing ??
    (await prisma.engagement.create({
      data: {
        organizationId,
        type,
        periodStart: bounds.start,
        periodEnd: bounds.end,
        status,
      },
    }))

  return NextResponse.json(engagement, { status: existing ? 200 : 201 })
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { id, status } = body || {}

  if (!id || typeof status !== 'string') {
    return NextResponse.json({ error: 'id and status are required.' }, { status: 400 })
  }

  const updated = await prisma.engagement.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      type: true,
      periodStart: true,
      periodEnd: true,
      status: true,
      organizationId: true,
      organization: { select: { name: true } },
    },
  })

  return NextResponse.json(
    {
      id: updated.id,
      type: updated.type,
      periodStart: updated.periodStart,
      periodEnd: updated.periodEnd,
      status: updated.status,
      organizationId: updated.organizationId,
      organizationName: updated.organization?.name ?? null,
    },
    { status: 200 },
  )
}
