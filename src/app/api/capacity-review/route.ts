import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cloneCapacityReview, DEFAULT_CAPACITY_REVIEW, type CapacityReviewSection } from '@/lib/capacity-review'

type Payload = {
  section: CapacityReviewSection
}

const SECTION_KEY = 'dashboard.capacityReview'

function normalizeSection(entry: any): CapacityReviewSection {
  return cloneCapacityReview(entry)
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
    return NextResponse.json({ section: cloneCapacityReview(DEFAULT_CAPACITY_REVIEW) })
  }

  try {
    const parsed = JSON.parse(note.text) as Payload
    if (!parsed || typeof parsed !== 'object') {
      return NextResponse.json({ section: cloneCapacityReview(DEFAULT_CAPACITY_REVIEW) })
    }

    return NextResponse.json({ section: cloneCapacityReview(parsed.section) })
  } catch (error) {
    console.warn('Failed to parse capacity review note', error)
    return NextResponse.json({ section: cloneCapacityReview(DEFAULT_CAPACITY_REVIEW) })
  }
}

export async function PUT(request: Request) {
  const payload = (await request.json()) as Partial<Payload> & { engagementId?: string }

  const { engagementId } = payload
  if (!engagementId) {
    return NextResponse.json({ error: 'engagementId is required.' }, { status: 400 })
  }

  const section = cloneCapacityReview(payload.section)

  await prisma.$transaction(async (tx) => {
    await tx.note.deleteMany({
      where: { engagementId, sectionKey: SECTION_KEY },
    })

    const hasContent =
      section.title.length ||
      section.summary.length ||
      section.highlightBullets.length ||
      section.systems.some(
        (row) => row.systemName.length || row.healthScore.length || row.status.length || row.remarks.length,
      ) ||
      section.screenshotCaption.length

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
