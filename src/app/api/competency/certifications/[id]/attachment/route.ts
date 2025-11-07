import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'

export const runtime = 'nodejs'

type Params = {
  params: { id: string }
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = params
  if (!id) {
    return NextResponse.json({ error: 'Certification id is required.' }, { status: 400 })
  }

  const record = await prisma.engineerCertification.findUnique({
    where: { id },
    select: {
      attachmentPath: true,
      attachmentName: true,
      attachmentMime: true,
    },
  })

  if (!record || !record.attachmentPath) {
    return NextResponse.json({ error: 'Attachment not found.' }, { status: 404 })
  }

  try {
  const file = await fs.readFile(record.attachmentPath)
    const headers = new Headers()
    const mime = record.attachmentMime || 'application/octet-stream'
    headers.set('Content-Type', mime)
    const filename = record.attachmentName || 'certification-attachment'
    headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`)
  return new NextResponse(file as unknown as BodyInit, { headers })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn('Failed to read certification attachment', error)
    }
    return NextResponse.json({ error: 'Attachment unavailable.' }, { status: 410 })
  }
}
