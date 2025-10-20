import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const item = await prisma.incident.findUnique({ where: { id: params.id } })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(req: Request, { params }: Params) {
  const body = await req.json()
  const item = await prisma.incident.update({ where: { id: params.id }, data: body })
  return NextResponse.json(item)
}

export async function DELETE(_req: Request, { params }: Params) {
  await prisma.incident.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
