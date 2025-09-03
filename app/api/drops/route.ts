import { NextResponse } from 'next/server'
import { prisma } from '@/src/server/db'

export async function GET() {
  try {
    const drops = await prisma.drop.findMany({ orderBy: { createdAt: 'desc' } })

    const grouped = drops.reduce<Record<string, typeof drops>>((acc, d) => {
      const key = d.status.toLowerCase()
      acc[key] = acc[key] || []
      acc[key].push(d)
      return acc
    }, {})

    return NextResponse.json(grouped)
  } catch (error) {
    console.error('Error fetching drops:', error)
    return NextResponse.json({ unclaimed: [], claimed: [], expired: [], upcoming: [] })
  }
}


