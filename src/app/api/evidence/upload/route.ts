import { NextResponse } from 'next/server'
import { saveFile } from '@/lib/upload'
import { prisma } from '@/lib/prisma'
// …imports stay the same…

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  const engagementId = form.get('engagementId') as string | null
  const sectionKey = form.get('sectionKey') as string | null
  const environment = form.get('environment') as string | null
  const incidentId = form.get('incidentId') as string | null   // NEW

  if (!file || !engagementId || !sectionKey) {
    return NextResponse.json({ error: 'Missing file or metadata' }, { status: 400 })
  }
  const saved = await saveFile(file)

  const ev = await prisma.evidence.create({
    data: {
      engagementId,
      sectionKey,
      filePath: saved.full,
      originalName: file.name,
      environment: environment || null,
      // tuck row-level context into JSON
      extra: incidentId ? { incidentId } : undefined,           // NEW
    }
  })
  return NextResponse.json({ ok: true, evidence: ev })
}

