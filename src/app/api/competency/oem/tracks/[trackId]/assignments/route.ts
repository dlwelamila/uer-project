import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recalcTrackProgress, toAssignmentStatusEnum } from '@/lib/oem-compliance'

export const runtime = 'nodejs'

type Params = {
  params: { trackId: string }
}

function sanitizeText(input: unknown) {
  if (typeof input !== 'string') return ''
  return input.trim()
}

function parseDate(value: unknown) {
  const raw = sanitizeText(value)
  if (!raw) return null
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.valueOf())) return null
  return parsed
}

export async function POST(request: Request, { params }: Params) {
  const { trackId } = params
  if (!trackId) {
    return NextResponse.json({ error: 'Track id is required.' }, { status: 400 })
  }

  const track = await prisma.oemComplianceTrack.findUnique({
    where: { id: trackId },
  })

  if (!track) {
    return NextResponse.json({ error: 'OEM compliance track not found.' }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const engineerName = sanitizeText((body as Record<string, unknown>).engineer)
  const engineerRole = sanitizeText((body as Record<string, unknown>).engineerRole)
  if (!engineerName) {
    return NextResponse.json({ error: 'Engineer name is required.' }, { status: 400 })
  }

  const certificationName = sanitizeText((body as Record<string, unknown>).certificationName)
  if (!certificationName) {
    return NextResponse.json({ error: 'Certification name is required.' }, { status: 400 })
  }

  const statusLabel = sanitizeText((body as Record<string, unknown>).status)
  const statusEnum = toAssignmentStatusEnum(statusLabel) ?? 'PENDING'

  const startedAt = parseDate((body as Record<string, unknown>).startedAt)
  const completedAt = parseDate((body as Record<string, unknown>).completedAt)
  const dueAt = parseDate((body as Record<string, unknown>).dueAt)

  const engineer = await prisma.engineer.upsert({
    where: { name: engineerName },
    update: {
      role: engineerRole || undefined,
    },
    create: {
      name: engineerName,
      role: engineerRole || null,
    },
  })

  let certificationId: string | null = null
  const requestedCertificationId = sanitizeText((body as Record<string, unknown>).certificationId)
  if (requestedCertificationId) {
    const certification = await prisma.engineerCertification.findUnique({
      where: { id: requestedCertificationId },
      select: { id: true, engineerId: true },
    })
    if (!certification) {
      return NextResponse.json({ error: 'Linked certification not found.' }, { status: 404 })
    }
    if (certification.engineerId && certification.engineerId !== engineer.id) {
      return NextResponse.json({ error: 'Certification does not belong to the specified engineer.' }, { status: 400 })
    }
    certificationId = certification.id
  }

  if (!certificationId && statusEnum === 'EARNED') {
    const existing = await prisma.engineerCertification.findFirst({
      where: {
        engineerId: engineer.id,
        certification: certificationName,
        vendor: track.oem,
      },
      select: { id: true },
    })
    certificationId = existing?.id ?? null
  }

  try {
    await prisma.oemComplianceAssignment.upsert({
      where: {
        trackId_engineerId_certificationName: {
          trackId,
          engineerId: engineer.id,
          certificationName,
        },
      },
      update: {
        status: statusEnum,
        startedAt,
        completedAt,
        dueAt,
        certificationId,
      },
      create: {
        trackId,
        engineerId: engineer.id,
        certificationName,
        status: statusEnum,
        startedAt,
        completedAt,
        dueAt,
        certificationId,
      },
    })

    const trackWithAssignments = await recalcTrackProgress(trackId)
    return NextResponse.json({ track: trackWithAssignments })
  } catch (error) {
    console.error('Failed to create OEM compliance assignment', error)
    return NextResponse.json({ error: 'Unable to create OEM compliance assignment.' }, { status: 500 })
  }
}
