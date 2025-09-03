import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/server/db'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const limit = Number(searchParams.get('limit') ?? '20')
  
  // Get real eligibility matches from the last 24 hours
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)
  
  // Find recent eligibility records and convert them to feed events
  const recentEligibility = await prisma.eligibility.findMany({
    where: {
      createdAt: { gte: oneDayAgo }
    },
    include: {
      drop: true
    },
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 100),
  })
  
  // Create feed events from eligibility records if they don't exist yet
  if (recentEligibility.length > 0) {
    await Promise.all(
      recentEligibility.map(async (record) => {
        // Check if we already have a feed event for this eligibility
        const existingEvent = await prisma.feedEvent.findFirst({
          where: {
            address: record.walletAddress,
            message: { contains: record.drop.name }
          }
        })
        
        if (!existingEvent) {
          // Create a new feed event
          await prisma.feedEvent.create({
            data: {
              address: record.walletAddress,
              message: `became eligible for $${record.valueUSD || record.drop.estValueUSD} from ${record.drop.name}`,
              valueUSD: record.valueUSD || record.drop.estValueUSD
            }
          })
        }
      })
    )
  }
  
  // Get all feed events
  let events = await prisma.feedEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 100),
  })
  
  // If no events exist, create some dummy events for activity
  if (events.length === 0) {
    await prisma.feedEvent.createMany({
      data: [
        { address: '0x1234...abcd', message: 'claimed $320 from Optimism', valueUSD: 320 },
        { address: '0x9fA1...BEEf', message: 'claimed $150 from Arbitrum', valueUSD: 150 },
        { address: '0xDeAd...BEEF', message: 'claimed $90 from zkSync', valueUSD: 90 },
      ],
      skipDuplicates: true,
    })
    events = await prisma.feedEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 100),
    })
  }
  
  return NextResponse.json(events)
}


