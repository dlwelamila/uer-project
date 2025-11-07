import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

type LeadPayload = {
  name?: string
  company?: string
  email?: string | null
  phone?: string | null
  manager?: string | null
  status?: string | null
  estimatedValue?: number | string | null
  probability?: number | string | null
  sector?: string | null
  region?: string | null
  source?: string | null
  notes?: string | null
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

function sanitizeProbability(value: unknown) {
  const number = toNullableInt(value)
  if (number === null) return null
  if (number < 0) return 0
  if (number > 100) return 100
  return number
}

function normalizePayload(payload: LeadPayload) {
  const name = toNullableString(payload.name)
  const company = toNullableString(payload.company)
  if (!name || !company) {
    throw new Error('Lead name and company are required')
  }

  const status = toNullableString(payload.status) ?? 'New Lead'

  return {
    name,
    company,
    email: toNullableString(payload.email),
    phone: toNullableString(payload.phone),
    manager: toNullableString(payload.manager),
    status,
    estimatedValue: toNullableInt(payload.estimatedValue),
    probability: sanitizeProbability(payload.probability),
    sector: toNullableString(payload.sector),
    region: toNullableString(payload.region),
    source: toNullableString(payload.source),
    notes: toNullableString(payload.notes),
  }
}

export async function GET() {
  const leads = await db.salesLead.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(leads)
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LeadPayload
    const data = normalizePayload(payload)
  const lead = await db.salesLead.create({ data })
    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: error.message }, { status: 422 })
    }
    console.error('Failed to create sales lead', error)
    return NextResponse.json({ error: 'Failed to create sales lead' }, { status: 500 })
  }
}
