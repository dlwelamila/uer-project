import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const engagementId = searchParams.get('engagementId') || undefined
  const sectionKey   = searchParams.get('sectionKey')   || undefined
  const incidentId   = searchParams.get('incidentId')   || undefined

  const where: any = {}
  if (engagementId) where.engagementId = engagementId
  if (sectionKey)   where.sectionKey   = sectionKey
  if (incidentId)   where.extra = { path: ['incidentId'], equals: incidentId }

  const rows = await prisma.evidence.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: { id: true, originalName: true, filePath: true, createdAt: true, extra: true },
  })
  return NextResponse.json(rows)
}
