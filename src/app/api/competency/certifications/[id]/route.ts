import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'

export const runtime = 'nodejs'

type Params = {
  params: { id: string }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = params
  if (!id) {
    return NextResponse.json({ error: 'Certification id is required.' }, { status: 400 })
  }

  const record = await prisma.engineerCertification.findUnique({
    where: { id },
    select: {
      id: true,
      attachmentPath: true,
    },
  })

  if (!record) {
    return NextResponse.json({ error: 'Certification not found.' }, { status: 404 })
  }

  await prisma.engineerCertification.delete({ where: { id } })

  if (record.attachmentPath) {
    try {
      await fs.unlink(record.attachmentPath)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.warn('Unable to remove certification attachment', error)
      }
    }
  }

  return NextResponse.json({ ok: true })
}
