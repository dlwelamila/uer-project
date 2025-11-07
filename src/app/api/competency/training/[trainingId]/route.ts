import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapTraining, toTrainingStatusEnum } from '@/lib/training'

export const runtime = 'nodejs'

function sanitizeText(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function clampProgress(value: unknown) {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10)
  if (Number.isNaN(parsed)) return null
  return Math.min(100, Math.max(0, parsed))
}

export async function PATCH(
  request: Request,
  context: { params: { trainingId: string } }
) {
  const { trainingId } = context.params
  if (!trainingId) {
    return NextResponse.json({ error: 'Training plan not found.' }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const existing = await prisma.engineerTraining.findUnique({
    where: { id: trainingId },
    include: { engineer: true },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Training plan not found.' }, { status: 404 })
  }

  const payload = body as Record<string, unknown>
  const updateData: Record<string, unknown> = {}

  const employee = sanitizeText(payload.employee)
  if (employee) {
    const engineer = await prisma.engineer.upsert({
      where: { name: employee },
      update: {},
      create: { name: employee },
    })
    updateData.engineer = { connect: { id: engineer.id } }
  }

  const vendor = sanitizeText(payload.vendor)
  if (vendor) {
    updateData.vendor = vendor
  }

  const moduleName = sanitizeText(payload.module)
  if (moduleName) {
    updateData.module = moduleName
  }

  if (payload.domain !== undefined) {
    const domain = sanitizeText(payload.domain)
    updateData.domain = domain || null
  }

  if (payload.timeline !== undefined) {
    const timeline = sanitizeText(payload.timeline)
    updateData.timeline = timeline || null
  }

  if (payload.progressPercent !== undefined) {
    const progressValue = clampProgress(payload.progressPercent)
    if (progressValue !== null) {
      updateData.progressPercent = progressValue
    }
  }

  if (payload.status !== undefined) {
    const statusLabel = sanitizeText(payload.status)
    updateData.status = toTrainingStatusEnum(statusLabel)
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ training: mapTraining(existing) })
  }

  const updated = await prisma.engineerTraining.update({
    where: { id: trainingId },
    data: updateData,
    include: { engineer: true },
  })

  return NextResponse.json({ training: mapTraining(updated) })
}

export async function DELETE(
  _request: Request,
  context: { params: { trainingId: string } }
) {
  const { trainingId } = context.params
  if (!trainingId) {
    return NextResponse.json({ error: 'Training plan not found.' }, { status: 404 })
  }

  try {
    await prisma.engineerTraining.delete({ where: { id: trainingId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Training plan not found.' }, { status: 404 })
    }
    console.error('Failed to delete training plan', error)
    return NextResponse.json({ error: 'Unable to remove training plan.' }, { status: 500 })
  }
}
