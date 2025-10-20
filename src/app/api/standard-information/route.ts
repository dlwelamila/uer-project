import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  cloneStandardInformation,
  DEFAULT_STANDARD_INFORMATION,
  type StandardInformationSection,
} from '@/lib/standard-information'

type Payload = {
  section: StandardInformationSection
}

const SECTION_KEY = 'reports.standardInformation'

function normalizeSection(entry: any): StandardInformationSection {
  return cloneStandardInformation(entry)
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
    return NextResponse.json({ section: cloneStandardInformation(DEFAULT_STANDARD_INFORMATION) })
  }

  try {
    const parsed = JSON.parse(note.text) as Payload
    if (!parsed || typeof parsed !== 'object') {
      return NextResponse.json({ section: cloneStandardInformation(DEFAULT_STANDARD_INFORMATION) })
    }

    return NextResponse.json({ section: normalizeSection(parsed.section) })
  } catch (error) {
    console.warn('Failed to parse standard information note', error)
    return NextResponse.json({ section: cloneStandardInformation(DEFAULT_STANDARD_INFORMATION) })
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
    section.contacts.some(
      (contact) =>
        contact.tier ||
        contact.name ||
        contact.role ||
        contact.email ||
        contact.phone ||
        contact.notes,
    ) ||
    section.additionalNotes.length

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
