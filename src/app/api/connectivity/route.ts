import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_CONNECTIVITY_NOTES } from '@/lib/connectivity'

type ConnectivityStatus = 'Connected' | 'Not Connected'

type ConnectivityRow = {
  assetId: string
  alternateAssetId?: string
  productName: string
  assetAlias?: string
  connectivityStatus: ConnectivityStatus
  lastAlertAt?: string
  connectionType?: string
  healthScore?: number | null
  healthLabel?: 'Good' | 'Fair' | 'Poor'
}

type ConnectivityPayload = {
  summary: {
    totalAssets: number
    connectedCount: number
  }
  rows: ConnectivityRow[]
  notes?: string[]
}

const SECTION_KEY = 'dashboard.connectivity'

const FALLBACK_DATA: ConnectivityPayload = {
  summary: {
    totalAssets: 57,
    connectedCount: 35,
  },
  rows: [
    {
      assetId: 'DE600204877487',
      alternateAssetId: '9WB1033',
      productName: 'VxRail E560F',
      assetAlias: 'VxRail E560F',
      connectivityStatus: 'Connected',
      lastAlertAt: '2025-02-06T02:35:42Z',
      connectionType: 'Secure Connect Gateway',
      healthScore: 100,
      healthLabel: 'Good',
    },
    {
      assetId: 'DE600204877489',
      alternateAssetId: '3VW2PKF3',
      productName: 'Dell EMC Unity XT 480',
      assetAlias: 'Unity-480',
      connectivityStatus: 'Connected',
      lastAlertAt: '2025-02-06T02:30:42Z',
      connectionType: 'Secure Connect Gateway',
      healthScore: 86,
      healthLabel: 'Fair',
    },
    {
      assetId: 'DE600204877459',
      alternateAssetId: '5VD2T3',
      productName: 'VxRail P570F',
      assetAlias: 'P570F-Archive',
      connectivityStatus: 'Not Connected',
      lastAlertAt: '2025-02-04T05:21:00Z',
      connectionType: 'Secure Connect Gateway',
      healthScore: 45,
      healthLabel: 'Poor',
    },
  ],
  notes: [...DEFAULT_CONNECTIVITY_NOTES],
}

function cloneRows(rows: ConnectivityRow[]): ConnectivityRow[] {
  return rows.map((row) => ({ ...row }))
}

function buildFallbackPayload(): ConnectivityPayload {
  return {
    summary: { ...FALLBACK_DATA.summary },
    rows: cloneRows(FALLBACK_DATA.rows),
    notes: [...(FALLBACK_DATA.notes ?? DEFAULT_CONNECTIVITY_NOTES)],
  }
}

function normalizeRow(entry: any): ConnectivityRow | null {
  const assetId = String(entry?.assetId ?? '').trim()
  if (!assetId) return null

  return {
    assetId,
    alternateAssetId: entry?.alternateAssetId ? String(entry.alternateAssetId).trim() : undefined,
    productName: String(entry?.productName ?? '').trim(),
    assetAlias: entry?.assetAlias ? String(entry.assetAlias).trim() : undefined,
    connectivityStatus:
      entry?.connectivityStatus === 'Not Connected' ? 'Not Connected' : 'Connected',
    lastAlertAt: entry?.lastAlertAt ? String(entry.lastAlertAt) : undefined,
    connectionType: entry?.connectionType ? String(entry.connectionType).trim() : undefined,
    healthScore:
      entry?.healthScore === null || entry?.healthScore === undefined
        ? null
        : Number(entry.healthScore),
    healthLabel:
      entry?.healthLabel === 'Good' || entry?.healthLabel === 'Fair' || entry?.healthLabel === 'Poor'
        ? entry.healthLabel
        : undefined,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const engagementId = searchParams.get('engagementId')
  if (!engagementId) {
    return NextResponse.json({ error: 'Missing engagementId' }, { status: 400 })
  }

  const note = await prisma.note.findFirst({
    where: { engagementId, sectionKey: SECTION_KEY },
  })

  if (!note?.text) {
    return NextResponse.json(buildFallbackPayload())
  }

  try {
    const parsed = JSON.parse(note.text) as ConnectivityPayload
    if (!parsed || typeof parsed !== 'object') {
      return NextResponse.json(FALLBACK_DATA)
    }

    const summary = {
      totalAssets: Number.isFinite(Number(parsed?.summary?.totalAssets))
        ? Number(parsed.summary.totalAssets)
        : FALLBACK_DATA.summary.totalAssets,
      connectedCount: Number.isFinite(Number(parsed?.summary?.connectedCount))
        ? Number(parsed.summary.connectedCount)
        : FALLBACK_DATA.summary.connectedCount,
    }

    const rows = Array.isArray(parsed.rows)
      ? parsed.rows
          .map((row) => normalizeRow(row))
          .filter((row): row is ConnectivityRow => Boolean(row))
      : []
    const parsedNotes = Array.isArray(parsed.notes)
      ? parsed.notes
          .map((note) => String(note ?? '').trim())
          .filter((note) => note.length > 0)
      : null
    const notes = parsedNotes ?? [...(FALLBACK_DATA.notes ?? DEFAULT_CONNECTIVITY_NOTES)]
    const safeRows = rows.length ? rows : cloneRows(FALLBACK_DATA.rows)

    return NextResponse.json({ summary, rows: safeRows, notes })
  } catch (error) {
    console.warn('Failed to parse connectivity note', error)
    return NextResponse.json(buildFallbackPayload())
  }
}

export async function PUT(request: Request) {
  const payload = (await request.json()) as Partial<ConnectivityPayload> & {
    engagementId?: string
  }

  const { engagementId } = payload
  if (!engagementId) {
    return NextResponse.json({ error: 'engagementId is required.' }, { status: 400 })
  }

  const summary = {
    totalAssets: Number.isFinite(Number(payload?.summary?.totalAssets))
      ? Number(payload!.summary!.totalAssets)
      : 0,
    connectedCount: Number.isFinite(Number(payload?.summary?.connectedCount))
      ? Number(payload!.summary!.connectedCount)
      : 0,
  }

  const normalizedRows = Array.isArray(payload.rows)
    ? payload.rows
        .map((row) => normalizeRow(row))
        .filter((row): row is ConnectivityRow => Boolean(row))
    : []
  const notes = Array.isArray(payload.notes)
    ? payload.notes
        .map((note) => String(note ?? '').trim())
        .filter((note) => note.length > 0)
    : []

  await prisma.$transaction(async (tx) => {
    await tx.note.deleteMany({
      where: { engagementId, sectionKey: SECTION_KEY },
    })

    if (normalizedRows.length || summary.totalAssets || summary.connectedCount || notes.length) {
      await tx.note.create({
        data: {
          engagementId,
          sectionKey: SECTION_KEY,
          text: JSON.stringify({
            summary,
            rows: normalizedRows,
            notes,
          }),
        },
      })
    }
  })

  return NextResponse.json({ ok: true })
}
