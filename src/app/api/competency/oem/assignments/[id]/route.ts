import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recalcTrackProgress, toAssignmentStatusEnum } from '@/lib/oem-compliance'

export const runtime = 'nodejs'

type Params = {
  params: { id: string }
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

export async function PATCH(request: Request, { params }: Params) {
  const { id } = params
  if (!id) {
    return NextResponse.json({ error: 'Assignment id is required.' }, { status: 400 })
  }

  const assignment = await prisma.oemComplianceAssignment.findUnique({
    where: { id },
    include: {
      engineer: true,
      track: { select: { id: true } },
    },
  })

  if (!assignment) {
    return NextResponse.json({ error: 'OEM compliance assignment not found.' }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}

  const statusLabel = sanitizeText((body as Record<string, unknown>).status)
  const statusEnum = toAssignmentStatusEnum(statusLabel)
  if (statusEnum) {
    data.status = statusEnum
  }

  if ((body as Record<string, unknown>).startedAt !== undefined) {
    data.startedAt = parseDate((body as Record<string, unknown>).startedAt)
  }

  if ((body as Record<string, unknown>).completedAt !== undefined) {
    data.completedAt = parseDate((body as Record<string, unknown>).completedAt)
  }

  if ((body as Record<string, unknown>).dueAt !== undefined) {
    data.dueAt = parseDate((body as Record<string, unknown>).dueAt)
  }

  const certificationIdValue = sanitizeText((body as Record<string, unknown>).certificationId)
  if ((body as Record<string, unknown>).certificationId !== undefined) {
    if (certificationIdValue) {
      const certification = await prisma.engineerCertification.findUnique({
        where: { id: certificationIdValue },
        select: { id: true, engineerId: true },
      })
      if (!certification) {
        return NextResponse.json({ error: 'Linked certification not found.' }, { status: 404 })
      }
      if (certification.engineerId && certification.engineerId !== assignment.engineerId) {
        return NextResponse.json({ error: 'Certification does not belong to the specified engineer.' }, { status: 400 })
      }
      data.certificationId = certification.id
    } else {
      data.certificationId = null
    }
  }

  const engineerRole = sanitizeText((body as Record<string, unknown>).engineerRole)
  if (engineerRole && engineerRole !== assignment.engineer?.role) {
    await prisma.engineer.update({
      where: { id: assignment.engineerId },
      data: { role: engineerRole },
    })
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided for update.' }, { status: 400 })
  }

  try {
    await prisma.oemComplianceAssignment.update({
      where: { id },
      data,
    })

    const track = await recalcTrackProgress(assignment.trackId)
    return NextResponse.json({ track })
  } catch (error) {
    console.error('Failed to update OEM compliance assignment', error)
    return NextResponse.json({ error: 'Unable to update OEM compliance assignment.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = params
  if (!id) {
    return NextResponse.json({ error: 'Assignment id is required.' }, { status: 400 })
  }

  const existing = await prisma.oemComplianceAssignment.findUnique({
    where: { id },
    select: { id: true, trackId: true },
  })

  if (!existing) {
    return NextResponse.json({ error: 'OEM compliance assignment not found.' }, { status: 404 })
  }

  try {
    await prisma.oemComplianceAssignment.delete({ where: { id } })
    const track = await recalcTrackProgress(existing.trackId)
    return NextResponse.json({ track })
  } catch (error) {
    console.error('Failed to delete OEM compliance assignment', error)
    return NextResponse.json({ error: 'Unable to delete OEM compliance assignment.' }, { status: 500 })
  }
}
