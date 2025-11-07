import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { saveFile } from '@/lib/upload'
import type { Prisma } from '@prisma/client'

export const runtime = 'nodejs'

const ALLOWED_STATUSES = new Set(['Active', 'Expires Soon', 'Expired'])
const ALLOWED_ATTACHMENT_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'image/webp',
])

type CertificationWithEngineer = Prisma.EngineerCertificationGetPayload<{
  include: { engineer: true }
}>

function resolveAttachmentType(mime: string | null | undefined) {
  if (!mime) return undefined
  if (mime === 'application/pdf') return 'pdf'
  if (mime.startsWith('image/')) return 'image'
  return undefined
}

function mapCertification(record: CertificationWithEngineer) {
  return {
    id: record.id,
    employee: record.engineer?.name ?? '',
    role: record.engineer?.role ?? '',
    certification: record.certification,
    vendor: record.vendor,
    domain: record.domain ?? 'General',
    year: record.year ?? new Date(record.createdAt).getFullYear(),
    expires: record.expires ? record.expires.toISOString() : '',
    status: record.status as 'Active' | 'Expires Soon' | 'Expired',
    statusDetail: record.statusDetail ?? record.status,
    notExpiring: record.notExpiring,
    attachmentUrl: record.attachmentPath ? `/api/competency/certifications/${record.id}/attachment` : undefined,
    attachmentName: record.attachmentName ?? undefined,
    attachmentType: resolveAttachmentType(record.attachmentMime),
  }
}

export async function GET() {
  const rows = await prisma.engineerCertification.findMany({
    include: { engineer: true },
    orderBy: [
      { engineer: { name: 'asc' } },
      { certification: 'asc' },
    ],
  })

  return NextResponse.json({ certifications: rows.map((row) => mapCertification(row)) })
}

export async function POST(request: Request) {
  const form = await request.formData()
  const employee = (form.get('employee') as string | null)?.trim()
  const role = (form.get('role') as string | null)?.trim()
  const certification = (form.get('certification') as string | null)?.trim()
  const vendor = (form.get('vendor') as string | null)?.trim()
  const domain = (form.get('domain') as string | null)?.trim() || null
  const yearValue = (form.get('year') as string | null)?.trim()
  const expiresValue = (form.get('expires') as string | null)?.trim()
  const status = (form.get('status') as string | null)?.trim() ?? 'Active'
  const statusDetailRaw = (form.get('statusDetail') as string | null)?.trim()
  const notExpiring = (form.get('notExpiring') as string | null) === 'true'
  const attachment = form.get('attachment') as File | null

  if (!employee || !certification || !vendor) {
    return NextResponse.json({ error: 'Employee, certification, and vendor are required.' }, { status: 400 })
  }

  if (!ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({ error: 'Invalid certification status.' }, { status: 400 })
  }

  let attachmentPath: string | undefined
  let attachmentName: string | undefined
  let attachmentMime: string | undefined

  if (attachment) {
    if (!ALLOWED_ATTACHMENT_MIME.has(attachment.type)) {
      return NextResponse.json({ error: 'Unsupported attachment type.' }, { status: 400 })
    }
    const saved = await saveFile(attachment)
    attachmentPath = saved.full
    attachmentName = attachment.name
    attachmentMime = attachment.type
  }

  const engineer = await prisma.engineer.upsert({
    where: { name: employee },
    update: { role: role || null },
    create: { name: employee, role: role || null },
  })

  let expires: Date | null = null
  if (!notExpiring && expiresValue) {
    const parsed = new Date(expiresValue)
    if (!Number.isNaN(parsed.valueOf())) {
      expires = parsed
    }
  }

  const year = yearValue ? Number.parseInt(yearValue, 10) : undefined

  const record = await prisma.engineerCertification.create({
    data: {
      engineerId: engineer.id,
      certification,
      vendor,
      domain,
      year: Number.isFinite(year as number) ? (year as number) : null,
      expires,
      status: notExpiring ? 'Active' : status,
      statusDetail: statusDetailRaw || (notExpiring ? 'Lifetime credential' : status),
      notExpiring,
      attachmentPath,
      attachmentName,
      attachmentMime,
    },
    include: { engineer: true },
  })

  return NextResponse.json({ certification: mapCertification(record) }, { status: 201 })
}
