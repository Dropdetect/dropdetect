import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/server/db'
import { requireAdmin } from '@/src/server/auth'

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const banners = await prisma.banner.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(banners)
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const created = await prisma.banner.create({ data: body })
  return NextResponse.json(created)
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const updated = await prisma.banner.update({ where: { id: body.id }, data: body })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await prisma.banner.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}


