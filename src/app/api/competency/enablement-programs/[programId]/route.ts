import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapEnablementProgram, toEnablementRoleEnum, type EnablementProgramModel } from '@/lib/enablement'

export const runtime = 'nodejs'

type EnablementProgramDelegate = {
  findUnique: (args: unknown) => Promise<EnablementProgramModel | null>
  update: (args: unknown) => Promise<EnablementProgramModel>
  delete: (args: unknown) => Promise<EnablementProgramModel>
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

  return undefined
}

function parseActiveYear(value: unknown) {
  if (value === undefined) return undefined
  const parsed = Number.parseInt(String(value ?? '').trim(), 10)
  if (Number.isNaN(parsed)) {
    return null
  }
  return Math.max(2000, Math.min(9999, parsed))
}

export async function PATCH(request: Request, context: { params: { programId: string } }) {
  const { programId } = context.params
  if (!programId) {
    return NextResponse.json({ error: 'Enablement program not found.' }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const existing = await enablementProgramClient().findUnique({ where: { id: programId } })
  if (!existing) {
    return NextResponse.json({ error: 'Enablement program not found.' }, { status: 404 })
  }

  const payload = body as Record<string, unknown>
  const updateData: Record<string, unknown> = {}

  if (payload.vendor !== undefined) {
    const vendor = sanitizeText(payload.vendor)
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor is required.' }, { status: 400 })
    }
    updateData.vendor = vendor
  }

  if (payload.specialization !== undefined) {
    const specialization = sanitizeText(payload.specialization)
    if (!specialization) {
      return NextResponse.json({ error: 'Specialization is required.' }, { status: 400 })
    }
    updateData.specialization = specialization
  }

  if (payload.role !== undefined) {
    updateData.role = toEnablementRoleEnum(payload.role)
  }

  if (payload.keywords !== undefined) {
    updateData.keywords = parseKeywords(payload.keywords) ?? existing.keywords
  }

  if (payload.activeYear !== undefined) {
    const activeYear = parseActiveYear(payload.activeYear)
    if (activeYear === null) {
      return NextResponse.json({ error: 'Active year must be a valid number.' }, { status: 400 })
    }
    updateData.activeYear = activeYear
  }

  if (payload.notes !== undefined) {
    updateData.notes = sanitizeOptionalText(payload.notes)
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ program: mapEnablementProgram(existing) })
  }

  try {
    const updated = await enablementProgramClient().update({
      where: { id: programId },
      data: updateData,
    })
    return NextResponse.json({ program: mapEnablementProgram(updated) })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Enablement program for this vendor, specialization, and role already exists.' },
        { status: 409 },
      )
    }

    console.error('Failed to update enablement program', error)
    return NextResponse.json({ error: 'Unable to update enablement program.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: { params: { programId: string } }) {
  const { programId } = context.params
  if (!programId) {
    return NextResponse.json({ error: 'Enablement program not found.' }, { status: 404 })
  }

  try {
  await enablementProgramClient().delete({ where: { id: programId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Enablement program not found.' }, { status: 404 })
    }

    console.error('Failed to delete enablement program', error)
    return NextResponse.json({ error: 'Unable to delete enablement program.' }, { status: 500 })
  }
}
