import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cloneRiskRegister, DEFAULT_RISK_REGISTER, type RiskRegisterSection } from '@/lib/risk-register'

type Payload = {
  section: RiskRegisterSection
}

const SECTION_KEY = 'reports.riskRegister'

function normalizeSection(entry: any): RiskRegisterSection {
  return cloneRiskRegister(entry)
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
    return NextResponse.json({ section: cloneRiskRegister(DEFAULT_RISK_REGISTER) })
  }

  try {
    const parsed = JSON.parse(note.text) as Payload
    if (!parsed || typeof parsed !== 'object') {
      return NextResponse.json({ section: cloneRiskRegister(DEFAULT_RISK_REGISTER) })
    }

    return NextResponse.json({ section: normalizeSection(parsed.section) })
  } catch (error) {
    console.warn('Failed to parse risk register note', error)
    return NextResponse.json({ section: cloneRiskRegister(DEFAULT_RISK_REGISTER) })
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
    section.rows.some(
      (row) =>
        row.category ||
        row.description ||
        row.priority ||
        row.probability ||
        row.owner ||
        row.status ||
        row.dueDate ||
        row.mitigation,
    )

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
