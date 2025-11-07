import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mapTraining, toTrainingStatusEnum } from '@/lib/training'

export const runtime = 'nodejs'

function sanitizeText(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function clampProgress(value: unknown) {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10)
  if (Number.isNaN(parsed)) return 0
  return Math.min(100, Math.max(0, parsed))
}

export async function GET() {
  const rows = await prisma.engineerTraining.findMany({
    orderBy: [
      { engineer: { name: 'asc' } },
      { module: 'asc' },
    ],
    include: { engineer: true },
  })

  return NextResponse.json({ training: rows.map(mapTraining) })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const employee = sanitizeText((body as Record<string, unknown>).employee)
  const vendor = sanitizeText((body as Record<string, unknown>).vendor)
  const moduleName = sanitizeText((body as Record<string, unknown>).module)

  if (!employee || !vendor || !moduleName) {
    return NextResponse.json(
      { error: 'Engineer, vendor, and module are required.' },
      { status: 400 }
    )
  }

  const domain = sanitizeText((body as Record<string, unknown>).domain)
  const timeline = sanitizeText((body as Record<string, unknown>).timeline)
  const progressPercent = clampProgress((body as Record<string, unknown>).progressPercent)
  const statusEnum = toTrainingStatusEnum((body as Record<string, unknown>).status as string | null)

  const engineer = await prisma.engineer.upsert({
    where: { name: employee },
    update: {},
    create: { name: employee },
  })

  try {
    const record = await prisma.engineerTraining.create({
      data: {
        engineerId: engineer.id,
        vendor,
        module: moduleName,
        domain: domain || null,
        progressPercent,
        timeline: timeline || null,
        status: statusEnum,
      },
      include: { engineer: true },
    })

    return NextResponse.json({ training: mapTraining(record) }, { status: 201 })
  } catch (error) {
    console.error('Failed to create training plan', error)
    return NextResponse.json({ error: 'Unable to create training plan.' }, { status: 500 })
  }
}
