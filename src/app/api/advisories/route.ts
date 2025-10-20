import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cloneAdvisories, DEFAULT_ADVISORIES, type AdvisorySection } from '@/lib/advisories'

type Payload = {
  sections: AdvisorySection[]
}

const SECTION_KEY = 'dashboard.advisories'

function normalizeSection(entry: any): AdvisorySection {
  const title = String(entry?.title ?? '').trim()
  const subtitle = String(entry?.subtitle ?? '').trim()
  const summary = String(entry?.summary ?? '').trim()
  const notes = Array.isArray(entry?.notes)
    ? entry.notes.map((note: any) => String(note ?? '').trim()).filter((note: string) => note.length > 0)
    : []

  return {
    title,
    subtitle,
    summary,
    notes,
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
    return NextResponse.json({ sections: cloneAdvisories(DEFAULT_ADVISORIES) })
  }

  try {
    const parsed = JSON.parse(note.text) as Payload
    if (!parsed || typeof parsed !== 'object') {
      return NextResponse.json({ sections: cloneAdvisories(DEFAULT_ADVISORIES) })
    }

    const sections = Array.isArray(parsed.sections)
      ? parsed.sections.map((section) => normalizeSection(section))
      : []

    return NextResponse.json({ sections: sections.length ? sections : cloneAdvisories(DEFAULT_ADVISORIES) })
  } catch (error) {
    console.warn('Failed to parse advisories note', error)
    return NextResponse.json({ sections: cloneAdvisories(DEFAULT_ADVISORIES) })
  }
}

export async function PUT(request: Request) {
  const payload = (await request.json()) as Partial<Payload> & { engagementId?: string }

  const { engagementId } = payload
  if (!engagementId) {
    return NextResponse.json({ error: 'engagementId is required.' }, { status: 400 })
  }

  const sections = Array.isArray(payload.sections)
    ? payload.sections
        .map((section) => normalizeSection(section))
    : []

  await prisma.$transaction(async (tx) => {
    await tx.note.deleteMany({
      where: { engagementId, sectionKey: SECTION_KEY },
    })

    if (sections.length) {
      await tx.note.create({
        data: {
          engagementId,
          sectionKey: SECTION_KEY,
          text: JSON.stringify({ sections }),
        },
      })
    }
  })

  return NextResponse.json({ ok: true })
}
