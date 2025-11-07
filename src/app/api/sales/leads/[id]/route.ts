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

function normalizeUpdatePayload(payload: LeadPayload) {
  const data: Record<string, unknown> = {}

  const name = toNullableString(payload.name)
  if (name) data.name = name

  const company = toNullableString(payload.company)
  if (company) data.company = company

  if ('email' in payload) data.email = toNullableString(payload.email ?? null)
  if ('phone' in payload) data.phone = toNullableString(payload.phone ?? null)
  if ('manager' in payload) data.manager = toNullableString(payload.manager ?? null)

  if ('status' in payload) {
    data.status = toNullableString(payload.status ?? null) ?? 'New Lead'
  }

  if ('estimatedValue' in payload) {
    data.estimatedValue = toNullableInt(payload.estimatedValue ?? null)
  }

  if ('probability' in payload) {
    data.probability = sanitizeProbability(payload.probability ?? null)
  }

  if ('sector' in payload) data.sector = toNullableString(payload.sector ?? null)
  if ('region' in payload) data.region = toNullableString(payload.region ?? null)
  if ('source' in payload) data.source = toNullableString(payload.source ?? null)
  if ('notes' in payload) data.notes = toNullableString(payload.notes ?? null)

  return data
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  if (!id) {
    return NextResponse.json({ error: 'Lead id is required' }, { status: 400 })
  }

  try {
    const payload = (await request.json()) as LeadPayload
    const data = normalizeUpdatePayload(payload)
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 })
    }

    const lead = await db.salesLead.update({
      where: { id },
      data,
    })

    return NextResponse.json(lead)
  } catch (error) {
    console.error(`Failed to update sales lead ${id}`, error)
    return NextResponse.json({ error: 'Failed to update sales lead' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  if (!id) {
    return NextResponse.json({ error: 'Lead id is required' }, { status: 400 })
  }

  try {
    await db.salesLead.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(`Failed to delete sales lead ${id}`, error)
    return NextResponse.json({ error: 'Failed to delete sales lead' }, { status: 500 })
  }
}
