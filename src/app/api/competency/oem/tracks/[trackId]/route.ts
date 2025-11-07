import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mapTrack, recalcTrackProgress, toTrackStatusEnum } from '@/lib/oem-compliance'

export const runtime = 'nodejs'

type Params = {
  params: { trackId: string }
}

function sanitizeText(input: unknown) {
  if (typeof input !== 'string') return ''
  return input.trim()
}

function parseNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isNaN(parsed) ? null : parsed
}

export async function PATCH(request: Request, { params }: Params) {
  const { trackId } = params
  if (!trackId) {
    return NextResponse.json({ error: 'Track id is required.' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  const oem = sanitizeText((body as Record<string, unknown>).oem)
  if (oem) data.oem = oem

  const specialization = sanitizeText((body as Record<string, unknown>).specialization)
  if (specialization) data.specialization = specialization

  const requiredCerts = parseNumber((body as Record<string, unknown>).requiredCerts)
  if (requiredCerts !== null && requiredCerts >= 0) {
    data.requiredCerts = requiredCerts
  }

  const overallRequirement = parseNumber((body as Record<string, unknown>).overallRequirement)
  if (overallRequirement !== null && overallRequirement >= 0) {
    data.overallRequirement = overallRequirement
  }

  const statusLabel = sanitizeText((body as Record<string, unknown>).complianceStatus)
  const statusEnum = toTrackStatusEnum(statusLabel)
  if (statusEnum) {
    data.complianceStatus = statusEnum
  }

  const roadmapNotes = sanitizeText((body as Record<string, unknown>).roadmapNotes)
  if ((body as Record<string, unknown>).roadmapNotes !== undefined) {
    data.roadmapNotes = roadmapNotes || null
  }

  const targetDateValue = sanitizeText((body as Record<string, unknown>).targetDate)
  if ((body as Record<string, unknown>).targetDate !== undefined) {
    if (targetDateValue) {
      const parsed = new Date(targetDateValue)
      if (!Number.isNaN(parsed.valueOf())) {
        data.targetDate = parsed
      }
    } else {
      data.targetDate = null
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided for update.' }, { status: 400 })
  }

  try {
    const updated = await prisma.oemComplianceTrack.update({
      where: { id: trackId },
      data,
      include: {
        assignments: {
          include: {
            engineer: true,
            certification: true,
          },
        },
      },
    })

    const recalculated = await recalcTrackProgress(trackId)
    return NextResponse.json({ track: recalculated ?? mapTrack(updated) })
  } catch (error) {
    console.error('Failed to update OEM compliance track', error)
    return NextResponse.json({ error: 'Unable to update OEM compliance track.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { trackId } = params
  if (!trackId) {
    return NextResponse.json({ error: 'Track id is required.' }, { status: 400 })
  }

  try {
    await prisma.oemComplianceTrack.delete({ where: { id: trackId } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to delete OEM compliance track', error)
    return NextResponse.json({ error: 'Unable to delete OEM compliance track.' }, { status: 500 })
  }
}
