import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cloneContractsReview, DEFAULT_CONTRACTS_REVIEW, type ContractsReviewSection } from '@/lib/contracts-review'

type Payload = {
  section: ContractsReviewSection
}

const SECTION_KEY = 'reports.contractsReview'

function normalizeSection(entry: any): ContractsReviewSection {
  return cloneContractsReview(entry)
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
    return NextResponse.json({ section: cloneContractsReview(DEFAULT_CONTRACTS_REVIEW) })
  }

  try {
    const parsed = JSON.parse(note.text) as Payload
    if (!parsed || typeof parsed !== 'object') {
      return NextResponse.json({ section: cloneContractsReview(DEFAULT_CONTRACTS_REVIEW) })
    }

    return NextResponse.json({ section: normalizeSection(parsed.section) })
  } catch (error) {
    console.warn('Failed to parse contracts review note', error)
    return NextResponse.json({ section: cloneContractsReview(DEFAULT_CONTRACTS_REVIEW) })
  }
}

export async function PUT(request: Request) {
  const payload = (await request.json()) as Partial<Payload> & { engagementId?: string }

  const { engagementId } = payload
  if (!engagementId) {
    return NextResponse.json({ error: 'engagementId is required.' }, { status: 400 })
  }

  const section = normalizeSection(payload.section)

  const hasContent =
    section.title.length ||
    section.summary.length ||
    section.keyNotes.length ||
    section.statusHighlights.some((item) => item.label || item.value) ||
    section.productHighlights.some((item) => item.label || item.value) ||
    section.screenshotCaption.length

  await prisma.$transaction(async (tx) => {
    await tx.note.deleteMany({
      where: { engagementId, sectionKey: SECTION_KEY },
    })

    if (hasContent) {
      await tx.note.create({
        data: {
          engagementId,
          sectionKey: SECTION_KEY,
          text: JSON.stringify({ section }),
        },
      })
    }
  })

  return NextResponse.json({ ok: true })
}
