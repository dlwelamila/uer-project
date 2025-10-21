import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function parseDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  if (typeof value === 'string' && value.trim().length) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  return null
}

function serializeIncident(row: any) {
  return {
    ...row,
    createdAt: row.createdAt?.toISOString?.() ?? null,
    resolvedAt: row.resolvedAt?.toISOString?.() ?? null,
    closedAt: row.closedAt?.toISOString?.() ?? null,
    srNumber: row.srNumber ?? row.sn ?? null,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const engagementId = searchParams.get('engagementId')

  const items = await prisma.incident.findMany({
    where: engagementId ? { engagementId } : undefined,
    orderBy: [{ createdAt: 'desc' }, { updatedTs: 'desc' }],
  })

  return NextResponse.json(items.map(serializeIncident))
}

export async function POST(req: Request) {
  const body = await req.json()

  const payload: any = {
    ...body,
    engagementId: body?.engagementId ?? null,
    createdAt: parseDate(body?.createdAt) ?? new Date(),
    resolvedAt: parseDate(body?.resolvedAt),
    closedAt: parseDate(body?.closedAt),
    sn: body?.sn ?? null,
    srNumber: body?.srNumber ?? body?.sn ?? null,
  }

  const item = await prisma.incident.create({ data: payload })
  return NextResponse.json(serializeIncident(item), { status: 201 })
}

export async function PUT(req: Request) {
  const body = (await req.json()) as {
    engagementId?: string
    incidents?: Array<Record<string, unknown>>
  }

  const engagementId = body?.engagementId
  if (!engagementId) {
    return NextResponse.json({ error: 'engagementId is required.' }, { status: 400 })
  }
  if (!Array.isArray(body?.incidents)) {
    return NextResponse.json({ error: 'incidents array is required.' }, { status: 400 })
  }

  const normalized = body.incidents
    .map((item) => {
      const summary = String(item?.summary ?? '').trim()
      if (!summary) return null
      return {
        id: item?.id ? String(item.id) : undefined,
        systemName: String(item?.system ?? '').trim(),
        sn: String(item?.sn ?? '').trim(),
        codeLevel: String(item?.codeLevel ?? '').trim(),
        summary,
        createdAt: parseDate(item?.createdAt) ?? new Date(),
        resolvedAt: parseDate(item?.resolvedAt),
        closedAt: parseDate(item?.closedAt),
        status: String(item?.status ?? '').trim(),
        impact: String(item?.impact ?? '').trim(),
        resolution: String(item?.resolution ?? '').trim(),
        recommendation: String(item?.recommendation ?? '').trim(),
      }
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const existing = await prisma.incident.findMany({
    where: { engagementId },
    select: { id: true },
  })
  const existingIds = new Set(existing.map((row) => row.id))
  const incomingIds = new Set(normalized.map((row) => row.id).filter(Boolean) as string[])

  const deleteIds = existing
    .map((row) => row.id)
    .filter((id) => !incomingIds.has(id))

  const result = await prisma.$transaction(async (tx) => {
    if (deleteIds.length) {
      await tx.incident.deleteMany({ where: { id: { in: deleteIds } } })
    }

    const updated: any[] = []
    for (const incident of normalized) {
      if (incident.id && existingIds.has(incident.id)) {
        const { id, ...data } = incident
        const row = await tx.incident.update({
          where: { id },
          data: {
            ...data,
            engagementId,
            srNumber: incident.sn,
            systemName: incident.systemName,
          },
        })
        updated.push(row)
      } else {
        const { id: _discard, ...data } = incident
        const row = await tx.incident.create({
          data: {
            ...data,
            engagementId,
            srNumber: incident.sn,
          },
        })
        updated.push(row)
      }
    }

    return tx.incident.findMany({
      where: { engagementId },
      orderBy: [{ createdAt: 'desc' }, { updatedTs: 'desc' }],
    })
  })

  return NextResponse.json(result.map(serializeIncident))
}
