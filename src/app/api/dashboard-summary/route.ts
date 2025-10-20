import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  type DashboardChannelSplit,
  type DashboardSeverity,
  type DashboardSeveritySplit,
  type DashboardSummary,
  type DashboardTopProduct,
  type DashboardTrendPoint,
  type DashboardKeyNote,
  type DashboardSparePart,
} from '@/lib/dashboard'

const TOP_PRODUCTS_SECTION = 'dashboard.topProducts'
const SEVERITY_SECTION = 'dashboard.severity'
const KEY_NOTES_SECTION = 'dashboard.keyNotes'
const SPARE_PARTS_SECTION = 'dashboard.spareParts'
const TREND_META_SECTION = 'dashboard.trendMeta'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const engagementId = searchParams.get('engagementId')

  if (!engagementId) {
    return NextResponse.json({ error: 'Missing engagementId' }, { status: 400 })
  }

  const [
    topNote,
    severityNote,
    keyNotesNote,
    sparePartsNote,
    channelStats,
    volumePoints,
    trendMetaNote,
  ] = await Promise.all([
    prisma.note.findFirst({
      where: { engagementId, sectionKey: TOP_PRODUCTS_SECTION },
    }),
    prisma.note.findFirst({
      where: { engagementId, sectionKey: SEVERITY_SECTION },
    }),
    prisma.note.findFirst({
      where: { engagementId, sectionKey: KEY_NOTES_SECTION },
    }),
    prisma.note.findFirst({
      where: { engagementId, sectionKey: SPARE_PARTS_SECTION },
    }),
    prisma.channelStat.findMany({
      where: { engagementId },
      orderBy: { channel: 'asc' },
    }),
    prisma.volumePoint.findMany({
      where: { engagementId },
      orderBy: { month: 'asc' },
    }),
    prisma.note.findFirst({
      where: { engagementId, sectionKey: TREND_META_SECTION },
    }),
  ])

  let topProducts: DashboardTopProduct[] = []
  let severity: DashboardSeveritySplit[] = []
  let keyNotes: DashboardKeyNote[] = []
  let spareParts: DashboardSparePart[] = []

  try {
    if (topNote?.text) {
      topProducts = JSON.parse(topNote.text)
    }
  } catch (err) {
    console.warn('Failed to parse topProducts note', err)
  }
  try {
    if (severityNote?.text) {
      severity = JSON.parse(severityNote.text)
    }
  } catch (err) {
    console.warn('Failed to parse severity note', err)
  }
  try {
    if (keyNotesNote?.text) {
      keyNotes = JSON.parse(keyNotesNote.text)
    }
  } catch (err) {
    console.warn('Failed to parse key notes note', err)
  }
  try {
    if (sparePartsNote?.text) {
      spareParts = JSON.parse(sparePartsNote.text)
    }
  } catch (err) {
    console.warn('Failed to parse spare parts note', err)
  }
  let trendMeta: Array<{ month: number; comparison?: number | null; note?: string }> = []
  try {
    if (trendMetaNote?.text) {
      trendMeta = JSON.parse(trendMetaNote.text)
    }
  } catch (err) {
    console.warn('Failed to parse trend meta note', err)
  }

  const channels: DashboardChannelSplit[] = channelStats.map((row) => ({
    channel: row.channel,
    percent: Number(row.percent ?? 0),
  }))

  const trendMetaMap = new Map<number, { comparison?: number | null; note?: string }>(
    trendMeta
      .filter((entry) => Number.isFinite(Number(entry?.month)))
      .map((entry) => [
        Number(entry?.month),
        {
          comparison:
            entry?.comparison === undefined || entry?.comparison === null
              ? null
              : Number(entry.comparison),
          note: entry?.note ?? '',
        },
      ]),
  )

  const trend: DashboardTrendPoint[] = volumePoints.map((row) => {
    const meta = trendMetaMap.get(row.month)
    return {
      month: row.month,
      value: row.value,
      comparison:
        meta?.comparison === undefined || meta?.comparison === null
          ? null
          : Number(meta.comparison),
      note: meta?.note ?? '',
    }
  })

  return NextResponse.json({
    topProducts,
    severity,
    channels,
    trend,
    keyNotes,
    spareParts,
  })
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<DashboardSummary> & {
    engagementId?: string
  }

  const { engagementId } = payload
  if (!engagementId) {
    return NextResponse.json({ error: 'Missing engagementId' }, { status: 400 })
  }

  const engagement = await prisma.engagement.findUnique({
    where: { id: engagementId },
    select: { periodStart: true },
  })

  if (!engagement) {
    return NextResponse.json({ error: 'Engagement not found' }, { status: 404 })
  }

  const baseYear = engagement.periodStart.getUTCFullYear()
  const topProducts = Array.isArray(payload.topProducts) ? payload.topProducts : []
  const severity = Array.isArray(payload.severity) ? payload.severity : []
  const channels = Array.isArray(payload.channels) ? payload.channels : []
  const trend = Array.isArray(payload.trend) ? payload.trend : []
  const keyNotes = Array.isArray(payload.keyNotes) ? payload.keyNotes : []
  const spareParts = Array.isArray(payload.spareParts) ? payload.spareParts : []

  const normalizedTopProducts: DashboardTopProduct[] = topProducts
    .map((row) => ({
      product: String(row?.product ?? '').trim(),
      count: Math.round(Number(row?.count ?? 0)),
      percent: Number(row?.percent ?? 0),
    }))
    .filter((row) => row.product.length > 0)

  const allowedSeverities: DashboardSeverity[] = ['S1', 'S2', 'S3', 'S5']
  const normalizedSeverity: DashboardSeveritySplit[] = severity
    .map((row) => {
      const severityValue = allowedSeverities.includes(row?.severity as DashboardSeverity)
        ? (row!.severity as DashboardSeverity)
        : 'S2'
      return {
        severity: severityValue,
        percent: Number(row?.percent ?? 0),
      }
    })

  const normalizedChannels: DashboardChannelSplit[] = channels
    .map((row) => ({
      channel: String(row?.channel ?? '').trim(),
      percent: Number(row?.percent ?? 0),
    }))
    .filter((row) => row.channel.length > 0)

  const normalizedTrend: DashboardTrendPoint[] = trend.map((row) => {
    const month = Math.min(12, Math.max(1, Math.round(Number(row?.month ?? 1))))
    const value = Math.round(Number(row?.value ?? 0))
    const note = String(row?.note ?? '').trim()
    const comparisonRaw = row?.comparison
    const comparison =
      comparisonRaw === undefined || comparisonRaw === null || Number.isNaN(Number(comparisonRaw))
        ? null
        : Math.round(Number(comparisonRaw))

    return {
      month,
      value,
      comparison: Number.isFinite(comparison as number) ? comparison : null,
      note,
    }
  })

  const normalizedKeyNotes: DashboardKeyNote[] = keyNotes
    .map((note) => String(note ?? '').trim())
    .filter((note) => note.length > 0)

  const normalizedSpareParts: DashboardSparePart[] = spareParts
    .map((row) => ({
      product: String(row?.product ?? '').trim(),
      sparePart: String(row?.sparePart ?? '').trim(),
      qty: String(row?.qty ?? '').trim(),
      mode: String(row?.mode ?? '').trim(),
    }))
    .filter((row) => row.product.length > 0 || row.sparePart.length > 0 || row.qty.length > 0 || row.mode.length > 0)

  const trendMetaPayload = normalizedTrend
    .filter((row) => {
      const hasNote = Boolean(row.note && row.note.trim().length > 0)
      const hasComparison = row.comparison !== null && row.comparison !== undefined
      return hasNote || hasComparison
    })
    .map((row) => ({
      month: row.month,
      comparison: row.comparison,
      note: row.note ?? '',
    }))

  await prisma.$transaction(async (tx) => {
    await tx.note.deleteMany({
      where: {
        engagementId,
        sectionKey: {
          in: [
            TOP_PRODUCTS_SECTION,
            SEVERITY_SECTION,
            KEY_NOTES_SECTION,
            SPARE_PARTS_SECTION,
            TREND_META_SECTION,
          ],
        },
      },
    })

    if (normalizedTopProducts.length) {
      await tx.note.create({
        data: {
          engagementId,
          sectionKey: TOP_PRODUCTS_SECTION,
          text: JSON.stringify(normalizedTopProducts),
        },
      })
    }

    if (normalizedSeverity.length) {
      await tx.note.create({
        data: {
          engagementId,
          sectionKey: SEVERITY_SECTION,
          text: JSON.stringify(normalizedSeverity),
        },
      })
    }

    if (normalizedKeyNotes.length) {
      await tx.note.create({
        data: {
          engagementId,
          sectionKey: KEY_NOTES_SECTION,
          text: JSON.stringify(normalizedKeyNotes),
        },
      })
    }

    if (normalizedSpareParts.length) {
      await tx.note.create({
        data: {
          engagementId,
          sectionKey: SPARE_PARTS_SECTION,
          text: JSON.stringify(normalizedSpareParts),
        },
      })
    }

    if (trendMetaPayload.length) {
      await tx.note.create({
        data: {
          engagementId,
          sectionKey: TREND_META_SECTION,
          text: JSON.stringify(trendMetaPayload),
        },
      })
    }

    await tx.channelStat.deleteMany({ where: { engagementId } })
    if (normalizedChannels.length) {
      await tx.channelStat.createMany({
        data: normalizedChannels.map((row) => ({
          engagementId,
          channel: row.channel,
          percent: Number.isFinite(row.percent) ? Number(row.percent) : 0,
        })),
      })
    }

    await tx.volumePoint.deleteMany({ where: { engagementId } })
    if (normalizedTrend.length) {
      await tx.volumePoint.createMany({
        data: normalizedTrend.map((row) => ({
          engagementId,
          month: row.month,
          year: baseYear,
          value: Number.isFinite(row.value) ? Number(row.value) : 0,
        })),
      })
    }
  })

  return NextResponse.json({ ok: true })
}

