import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapEnablementProgram, toEnablementRoleEnum, type EnablementProgramModel } from '@/lib/enablement'

export const runtime = 'nodejs'

type EnablementProgramDelegate = {
  findMany: (args: unknown) => Promise<EnablementProgramModel[]>
  create: (args: unknown) => Promise<EnablementProgramModel>
}

function enablementProgramClient(): EnablementProgramDelegate {
  // Cast until `prisma generate` refreshes the client with the EnablementProgram delegate locally.
  return (prisma as unknown as { enablementProgram: EnablementProgramDelegate }).enablementProgram
}

function sanitizeText(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function sanitizeOptionalText(value: unknown) {
  const text = sanitizeText(value)
  return text.length > 0 ? text : null
}

function parseKeywords(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => entry.length > 0)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
  }

  return [] as string[]
}

function parseActiveYear(value: unknown) {
  const currentYear = new Date().getFullYear()
  const parsed = Number.parseInt(String(value ?? currentYear).trim(), 10)
  if (Number.isNaN(parsed)) {
    return currentYear
  }
  return Math.max(2000, Math.min(9999, parsed))
}

export async function GET() {
  const rows = await enablementProgramClient().findMany({
    orderBy: [
      { vendor: 'asc' },
      { specialization: 'asc' },
      { role: 'asc' },
    ],
  })

  return NextResponse.json({ programs: rows.map(mapEnablementProgram) })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  const vendor = sanitizeText(payload.vendor)
  const specialization = sanitizeText(payload.specialization)

  if (!vendor || !specialization) {
    return NextResponse.json(
      { error: 'Vendor and specialization are required.' },
      { status: 400 },
    )
  }

  const role = toEnablementRoleEnum(payload.role)
  const keywords = parseKeywords(payload.keywords)
  const activeYear = parseActiveYear(payload.activeYear)
  const notes = sanitizeOptionalText(payload.notes)

  try {
    const record = await enablementProgramClient().create({
      data: {
        vendor,
        specialization,
        role,
        keywords,
        activeYear,
        notes,
      },
    })

    return NextResponse.json({ program: mapEnablementProgram(record) }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Enablement program for this vendor, specialization, and role already exists.' },
        { status: 409 },
      )
    }

    console.error('Failed to create enablement program', error)
    return NextResponse.json({ error: 'Unable to create enablement program.' }, { status: 500 })
  }
}
