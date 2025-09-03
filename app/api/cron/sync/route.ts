import { NextRequest, NextResponse } from 'next/server'
import { fetchGitHubAirdrops } from '@/src/server/fetchers/github'
import { prisma } from '@/src/server/db'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const headerSecret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!process.env.CRON_SECRET || headerSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const logs = await fetchGitHubAirdrops()

  // Ensure at least one live feed event exists
  const count = await prisma.feedEvent.count()
  if (count === 0) {
    await prisma.feedEvent.create({ data: { address: '0x1234...abcd', message: 'claimed $320 from Optimism', valueUSD: 320 } })
  }

  return NextResponse.json({ ok: true, logs })
}


