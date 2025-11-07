import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mapTrack, toTrackStatusEnum } from '@/lib/oem-compliance'

export const runtime = 'nodejs'

function sanitizeText(input: unknown) {
  if (typeof input !== 'string') return ''
  return input.trim()
}

function parseNumber(value: unknown, fallback: number) {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  if (Number.isNaN(parsed)) return fallback
  return parsed
}

export async function GET() {
  const tracks = await prisma.oemComplianceTrack.findMany({
    orderBy: [
      { oem: 'asc' },
      { specialization: 'asc' },
    ],
    include: {
      assignments: {
        include: {
          engineer: true,
          certification: true,
        },
      },
    },
  })

  return NextResponse.json({ tracks: tracks.map(mapTrack) })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const oem = sanitizeText((body as Record<string, unknown>).oem)
  const specialization = sanitizeText((body as Record<string, unknown>).specialization)
  if (!oem || !specialization) {
    return NextResponse.json({ error: 'OEM and specialization are required.' }, { status: 400 })
  }

  const requiredCerts = Math.max(0, parseNumber((body as Record<string, unknown>).requiredCerts, 0))
  const overallRequirementRaw = parseNumber((body as Record<string, unknown>).overallRequirement, requiredCerts)
  const overallRequirement = Math.max(requiredCerts, overallRequirementRaw)

  let targetDate: Date | null = null
  const targetValue = sanitizeText((body as Record<string, unknown>).targetDate)
  if (targetValue) {
    const parsed = new Date(targetValue)
    if (!Number.isNaN(parsed.valueOf())) {
      targetDate = parsed
    }
  }

  const roadmapNotes = sanitizeText((body as Record<string, unknown>).roadmapNotes)
  const statusLabel = sanitizeText((body as Record<string, unknown>).complianceStatus)
  const statusEnum = toTrackStatusEnum(statusLabel) ?? 'PENDING'

  try {
    const track = await prisma.oemComplianceTrack.create({
      data: {
        oem,
        specialization,
        requiredCerts,
        earnedCerts: 0,
        overallRequirement,
        overallEarned: 0,
        complianceStatus: statusEnum,
        targetDate,
        roadmapNotes: roadmapNotes || null,
      },
      include: {
        assignments: {
          include: {
            engineer: true,
            certification: true,
          },
        },
      },
    })

    return NextResponse.json({ track: mapTrack(track) }, { status: 201 })
  } catch (error) {
    console.error('Failed to create OEM compliance track', error)
    return NextResponse.json({ error: 'Unable to create OEM compliance track.' }, { status: 500 })
  }
}
