import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const db = prisma as any

type AccountInput = {
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

export async function GET() {
  const accounts = await db.projectAccount.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(accounts.map(serializeAccount))
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as AccountInput
  const name = body.name?.trim()

  if (!name) {
    return NextResponse.json({ error: 'name is required.' }, { status: 400 })
  }

  const existing = await db.projectAccount.findUnique({ where: { name } })
  if (existing) {
    return NextResponse.json(serializeAccount(existing))
  }

  const record = await db.projectAccount.create({
    data: {
      name,
      industry: body.industry?.trim() ?? null,
      region: body.region?.trim() ?? null,
    },
  })

  return NextResponse.json(serializeAccount(record), { status: 201 })
}
