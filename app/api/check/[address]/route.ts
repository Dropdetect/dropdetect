import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/server/db'
import { DropStatus, EligibilityStatus } from '@prisma/client'

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address.toLowerCase()
  if (!address || address.length < 4) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  // Get all eligibility records for this address
  const eligibilityRecords = await prisma.eligibility.findMany({
    where: { walletAddress: address },
    include: { drop: true },
  })

  // Get all drops for upcoming section
  const allDrops = await prisma.drop.findMany({
    where: {
      status: { in: [DropStatus.UNCLAIMED, DropStatus.UPCOMING] },
      // Exclude drops that the user is already eligible for
      NOT: {
        id: { in: eligibilityRecords.map(record => record.dropId) }
      }
    },
    orderBy: { createdAt: 'desc' },
  })

  // Format eligible drops
  const eligible = eligibilityRecords.map(record => ({
    id: record.drop.id,
    name: record.drop.name,
    symbol: record.drop.symbol,
    logoUrl: record.drop.logoUrl,
    valueUSD: record.valueUSD || record.drop.estValueUSD,
    claimUrl: record.drop.claimUrl,
    status: record.status === EligibilityStatus.CLAIMED ? 'CLAIMED' : 'UNCLAIMED',
  }))

  // Format upcoming drops
  const upcoming = allDrops.map(drop => ({
    id: drop.id,
    name: drop.name,
    symbol: drop.symbol,
    logoUrl: drop.logoUrl,
    valueUSD: drop.estValueUSD,
    claimUrl: drop.claimUrl,
    status: drop.status,
  }))

  // Update eligibility cache for analytics purposes
  await Promise.all(
    [...eligibilityRecords.map(record => record.dropId), ...allDrops.map(drop => drop.id)].map(
      async (dropId) => {
        const isEligible = eligibilityRecords.some(record => record.dropId === dropId)
        await prisma.eligibilityCache.upsert({
          where: { address_dropId: { address, dropId } },
          update: { eligible: isEligible, checkedAt: new Date() },
          create: { address, dropId, eligible: isEligible },
        })
      }
    )
  )

  return NextResponse.json({ 
    address, 
    eligible: eligible.length > 0 ? eligible : [], 
    upcoming 
  })
}


