import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const e = await prisma.engagement.findFirst({
    orderBy: { periodStart: 'desc' }
  })
  return NextResponse.json(e ?? null)
}
