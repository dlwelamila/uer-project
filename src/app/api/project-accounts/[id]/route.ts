import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const db = prisma as any

type AccountUpdateInput = {
  name?: string
  industry?: string | null
  region?: string | null
}

function serializeAccount(record: any) {
  return {
    id: record.id,
    name: record.name,
    industry: record.industry,
    region: record.region,
    createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : null,
    updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString() : null,
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const body = (await request.json().catch(() => ({}))) as AccountUpdateInput

  const existing = await db.projectAccount.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Account not found.' }, { status: 404 })
  }

  const updated = await db.projectAccount.update({
    where: { id },
    data: {
      name: body.name?.trim() ?? existing.name,
      industry: body.industry !== undefined ? body.industry?.trim() ?? null : existing.industry,
      region: body.region !== undefined ? body.region?.trim() ?? null : existing.region,
    },
  })

  return NextResponse.json(serializeAccount(updated))
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  await db.projectAccount.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
