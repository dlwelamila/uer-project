import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SAMPLE_ROWS = [
  {
    systemModel: 'Connectrix DS-6505B',
    assetCount: 3,
    installedCode: '7.2.1d',
    statuses: { o: true },
    minSupported7: '8.2.3d',
    minSupported8: '–',
    recommended7: '8.2.3e1',
    recommended8: '–',
    latest7: '8.2.3e2',
    latest8: '–',
  },
  {
    systemModel: 'DD6300 Appliance',
    assetCount: 2,
    installedCode: '7.7.2.0 / 7.7.5.30',
    statuses: { m: true },
    minSupported7: '7.7.1',
    minSupported8: '–',
    recommended7: 'LTS2024 7.13.1',
    recommended8: '–',
    latest7: '8.3.0.0',
    latest8: '–',
  },
  {
    systemModel: 'Dell EMC Unity P670F',
    assetCount: 18,
    installedCode: '0.0.0000 / 8.0.213-28667925',
    statuses: { r: true },
    minSupported7: '7.0.532',
    minSupported8: '8.0.000',
    recommended7: '7.0.532',
    recommended8: '8.0.311',
    latest7: '7.0.532',
    latest8: '8.0.311',
  },
  {
    systemModel: 'VxRail P570F',
    assetCount: 32,
    installedCode: '7.0.410 / 8.0.213 / 4.5.215',
    statuses: { l: true },
    minSupported7: '7.0.532',
    minSupported8: '8.0.000',
    recommended7: '7.0.532',
    recommended8: '8.0.311',
    latest7: '7.0.532',
    latest8: '8.0.311',
  },
]

const SECTION_KEY = 'dashboard.codeCurrency'

type StatusFlags = { o?: boolean; m?: boolean; r?: boolean; l?: boolean }

type CodeCurrencyRow = {
  systemModel: string
  assetCount: number
  installedCode: string
  statuses: StatusFlags
  minSupported7: string
  minSupported8: string
  recommended7: string
  recommended8: string
  latest7: string
  latest8: string
}

function normalizeRow(entry: any): CodeCurrencyRow | null {
  const systemModel = String(entry?.systemModel ?? '').trim()
  if (!systemModel) return null
  const assetCount = Number.isFinite(Number(entry?.assetCount)) ? Number(entry.assetCount) : 0
  const installedCode = String(entry?.installedCode ?? '').trim()
  const minSupported7 = String(entry?.minSupported7 ?? '').trim()
  const minSupported8 = String(entry?.minSupported8 ?? '').trim()
  const recommended7 = String(entry?.recommended7 ?? '').trim()
  const recommended8 = String(entry?.recommended8 ?? '').trim()
  const latest7 = String(entry?.latest7 ?? '').trim()
  const latest8 = String(entry?.latest8 ?? '').trim()
  const statuses: StatusFlags = {
    o: Boolean(entry?.statuses?.o),
    m: Boolean(entry?.statuses?.m),
    r: Boolean(entry?.statuses?.r),
    l: Boolean(entry?.statuses?.l),
  }

  return {
    systemModel,
    assetCount,
    installedCode,
    statuses,
    minSupported7,
    minSupported8,
    recommended7,
    recommended8,
    latest7,
    latest8,
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
    return NextResponse.json(SAMPLE_ROWS)
  }

  try {
    const parsed = JSON.parse(note.text)
    if (Array.isArray(parsed)) {
      const rows = parsed
        .map((entry) => normalizeRow(entry))
        .filter((row): row is CodeCurrencyRow => Boolean(row))
      return NextResponse.json(rows.length ? rows : SAMPLE_ROWS)
    }
  } catch (error) {
    console.warn('Failed to parse code currency note', error)
  }

  return NextResponse.json(SAMPLE_ROWS)
}

export async function PUT(request: Request) {
  const body = await request.json()
  const engagementId = body?.engagementId
  if (!engagementId || typeof engagementId !== 'string') {
    return NextResponse.json({ error: 'engagementId is required.' }, { status: 400 })
  }
  if (!Array.isArray(body?.rows)) {
    return NextResponse.json({ error: 'rows array is required.' }, { status: 400 })
  }

  const normalizedRows = body.rows
    .map((entry: any) => normalizeRow(entry))
    .filter((row: CodeCurrencyRow | null): row is CodeCurrencyRow => Boolean(row))

  await prisma.$transaction(async (tx) => {
    await tx.note.deleteMany({
      where: { engagementId, sectionKey: SECTION_KEY },
    })

    if (normalizedRows.length) {
      await tx.note.create({
        data: {
          engagementId,
          sectionKey: SECTION_KEY,
          text: JSON.stringify(normalizedRows),
        },
      })
    }
  })

  return NextResponse.json({ ok: true })
}
