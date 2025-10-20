import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const db = prisma as any

type ManagerInput = {
  name?: string
  email?: string | null
  phone?: string | null
  accountIds?: string[]
}

function normalize(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

async function syncAccountLinks(managerId: string, accountIds: string[] | undefined) {
  if (!Array.isArray(accountIds)) return
  const filtered = Array.from(new Set(accountIds.filter((value) => typeof value === 'string' && value.trim().length)))
  if (!filtered.length) return

  const accounts = await db.projectAccount.findMany({ where: { id: { in: filtered } } })
  for (const account of accounts) {
    await db.projectManagerAccount.upsert({
      where: {
        managerId_accountId: {
          managerId,
          accountId: account.id,
        },
      },
      update: {},
      create: { managerId, accountId: account.id },
    })
  }
}

function serializeManager(record: any) {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    phone: record.phone,
    accounts: Array.isArray(record.accountLinks)
      ? record.accountLinks
          .map((link: any) => (link.account ? { id: link.account.id, name: link.account.name } : null))
          .filter(Boolean)
      : [],
    createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : null,
    updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString() : null,
  }
}

export async function GET() {
  const managers = await db.projectManager.findMany({
    include: {
      accountLinks: {
        include: { account: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(managers.map(serializeManager))
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ManagerInput
  const name = normalize(body.name)

  if (!name) {
    return NextResponse.json({ error: 'name is required.' }, { status: 400 })
  }

  const email = normalize(body.email)
  const phone = normalize(body.phone)

  const orConditions: any[] = [{ name }]
  if (email) {
    orConditions.push({ email })
  }

  const existing = await db.projectManager.findFirst({
    where: {
      OR: orConditions,
    },
  })

  if (existing) {
    await syncAccountLinks(existing.id, body.accountIds)
    const record = await db.projectManager.findUnique({
      where: { id: existing.id },
      include: { accountLinks: { include: { account: true } } },
    })
    if (!record) {
      return NextResponse.json({ error: 'Manager not found.' }, { status: 404 })
    }
    return NextResponse.json(serializeManager(record), { status: 200 })
  }

  const manager = await db.projectManager.create({
    data: {
      name,
      email,
      phone,
    },
  })

  await syncAccountLinks(manager.id, body.accountIds)

  const record = await db.projectManager.findUnique({
    where: { id: manager.id },
    include: { accountLinks: { include: { account: true } } },
  })

  if (!record) {
    return NextResponse.json({ error: 'Manager not found.' }, { status: 404 })
  }

  return NextResponse.json(serializeManager(record), { status: 201 })
}
