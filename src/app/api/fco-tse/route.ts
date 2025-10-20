import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cloneFcoTseRows, type FcoTseRow } from '@/lib/fco-tse'

type Payload = {
  rows: FcoTseRow[]
}

const SECTION_KEY = 'dashboard.fcoTse'

const FALLBACK_PAYLOAD: Payload = {
  rows: cloneFcoTseRows([]),
}

function normalizeRow(entry: any): FcoTseRow | null {
  const srCreated = String(entry?.srCreated ?? '').trim()
  const fcoId = String(entry?.fcoId ?? '').trim()
  const description = String(entry?.description ?? '').trim()
  const srNumber = String(entry?.srNumber ?? '').trim()
  const severity = String(entry?.severity ?? '').trim()
  const serialNumber = String(entry?.serialNumber ?? '').trim()
  const status = String(entry?.status ?? '').trim()
  const productName = String(entry?.productName ?? '').trim()
  const problemSummary = String(entry?.problemSummary ?? '').trim()

  if (
    !srCreated &&
    !fcoId &&
    !description &&
    !srNumber &&
    !severity &&
    !serialNumber &&
    !status &&
    !productName &&
    !problemSummary
  ) {
    return null
  }

  return {
    srCreated,
    fcoId,
    description,
    srNumber,
    severity,
    serialNumber,
    status,
    productName,
    problemSummary,
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
    return NextResponse.json(FALLBACK_PAYLOAD)
  }

  try {
    const parsed = JSON.parse(note.text) as Payload
    if (!parsed || typeof parsed !== 'object') {
      return NextResponse.json(FALLBACK_PAYLOAD)
    }

    const rows = Array.isArray(parsed.rows)
      ? parsed.rows
          .map((row: any) => normalizeRow(row))
          .filter((row): row is FcoTseRow => Boolean(row))
      : []

    return NextResponse.json({ rows })
  } catch (error) {
    console.warn('Failed to parse FCO & TSE note', error)
    return NextResponse.json(FALLBACK_PAYLOAD)
  }
}

export async function PUT(request: Request) {
  const payload = (await request.json()) as Partial<Payload> & { engagementId?: string }

  const { engagementId } = payload
  if (!engagementId) {
    return NextResponse.json({ error: 'engagementId is required.' }, { status: 400 })
  }

  const rows = Array.isArray(payload.rows)
    ? payload.rows
        .map((row) => normalizeRow(row))
        .filter((row): row is FcoTseRow => Boolean(row))
    : []

  await prisma.$transaction(async (tx) => {
    await tx.note.deleteMany({
      where: { engagementId, sectionKey: SECTION_KEY },
    })

    if (rows.length) {
      await tx.note.create({
        data: {
          engagementId,
          sectionKey: SECTION_KEY,
          text: JSON.stringify({ rows }),
        },
      })
    }
  })

  return NextResponse.json({ ok: true })
}
