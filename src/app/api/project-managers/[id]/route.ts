import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const db = prisma as any

type ManagerUpdateInput = {
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

async function replaceAccountLinks(managerId: string, accountIds: unknown) {
  if (!Array.isArray(accountIds)) return
  const filtered = Array.from(new Set(accountIds.filter((value) => typeof value === 'string' && value.trim().length)))

  if (!filtered.length) {
    await db.projectManagerAccount.deleteMany({ where: { managerId } })
    return
  }

  await db.projectManagerAccount.deleteMany({
    where: {
      managerId,
      accountId: { notIn: filtered },
    },
  })

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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const body = (await request.json().catch(() => ({}))) as ManagerUpdateInput

  const existing = await db.projectManager.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Manager not found.' }, { status: 404 })
  }

  const name = body.name !== undefined ? normalize(body.name) ?? existing.name : existing.name
  const email = body.email !== undefined ? normalize(body.email) : existing.email
  const phone = body.phone !== undefined ? normalize(body.phone) : existing.phone

  const updated = await db.projectManager.update({
    where: { id },
    data: {
      name,
      email,
      phone,
    },
  })

  if (body.accountIds !== undefined) {
    await replaceAccountLinks(id, body.accountIds)
  }

  const record = await db.projectManager.findUnique({
    where: { id: updated.id },
    include: { accountLinks: { include: { account: true } } },
  })

  if (!record) {
    return NextResponse.json({ error: 'Manager not found.' }, { status: 404 })
  }

  return NextResponse.json(serializeManager(record))
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const manager = await db.projectManager.findUnique({ where: { id } })

  if (!manager) {
    return NextResponse.json({ error: 'Manager not found.' }, { status: 404 })
  }

  const activeProjects = await db.project.count({ where: { managerId: id } })
  if (activeProjects > 0) {
    return NextResponse.json(
      { error: 'Reassign any projects owned by this manager before deleting them.' },
      { status: 409 }
    )
  }

  try {
    await db.$transaction([
      db.projectManagerAccount.deleteMany({ where: { managerId: id } }),
      db.projectManager.delete({ where: { id } }),
    ])
  } catch (error) {
    return NextResponse.json({ error: 'Unable to delete manager with related records.' }, { status: 409 })
  }

  return NextResponse.json({ ok: true })
}
