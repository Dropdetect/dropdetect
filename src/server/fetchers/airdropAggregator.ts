import { PrismaClient, SourceType, DropStatus, RiskLevel } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

interface AirdropData {
  name: string
  symbol: string
  description?: string
  network?: string
  claimUrl?: string
  estValueUSD?: number
  status: string
  claimStartDate?: string
  claimEndDate?: string
  officialWebsite?: string
  twitterHandle?: string
  discordUrl?: string
  telegramUrl?: string
  isVerified?: boolean
  riskLevel?: string
}

const AIRDROP_AGGREGATORS = [
  {
    name: 'AirdropAlert',
    url: 'https://airdropalert.com/api/v1/airdrops',
    type: 'api'
  },
  {
    name: 'CoinAirdrops',
    url: 'https://coinairdrops.com/api/airdrops',
    type: 'api'
  },
  {
    name: 'AirdropBob',
    url: 'https://airdropbob.com/api/active',
    type: 'api'
  }
]

export async function fetchFromAirdropAggregators() {
  const logs: { source: string; newDrops: number; errors?: string }[] = []

  for (const aggregator of AIRDROP_AGGREGATORS) {
    try {
      // Create or update source record
      const sourceRecord = await prisma.source.upsert({
        where: { url: aggregator.url },
        update: { lastChecked: new Date() },
        create: { 
          name: aggregator.name, 
          url: aggregator.url, 
          type: SourceType.AIRDROP_AGGREGATOR,
          lastChecked: new Date()
        },
      })

      // Create fetch log
      const log = await prisma.fetchLog.create({ 
        data: { 
          sourceId: sourceRecord.id,
          metadata: { aggregator: aggregator.name }
        } 
      })

      let newDrops = 0

      if (aggregator.type === 'api') {
        const response = await axios.get(aggregator.url, {
          timeout: 30000,
          headers: {
            'User-Agent': 'DropDetect/1.0'
          }
        })

        const airdrops: AirdropData[] = response.data.data || response.data || []

        for (const airdrop of airdrops) {
          try {
            const dropStatus = mapStatusToEnum(airdrop.status)
            const riskLevel = mapRiskLevel(airdrop.riskLevel)

            await prisma.drop.upsert({
              where: { 
                name_symbol: {
                  name: airdrop.name,
                  symbol: airdrop.symbol || airdrop.name.substring(0, 4).toUpperCase()
                }
              },
              update: {
                description: airdrop.description,
                network: airdrop.network,
                claimUrl: airdrop.claimUrl,
                estValueUSD: airdrop.estValueUSD || 0,
                status: dropStatus,
                claimStartDate: airdrop.claimStartDate ? new Date(airdrop.claimStartDate) : null,
                claimEndDate: airdrop.claimEndDate ? new Date(airdrop.claimEndDate) : null,
                officialWebsite: airdrop.officialWebsite,
                twitterHandle: airdrop.twitterHandle,
                discordUrl: airdrop.discordUrl,
                telegramUrl: airdrop.telegramUrl,
                isVerified: airdrop.isVerified || false,
                riskLevel: riskLevel,
                updatedAt: new Date(),
              },
              create: {
                name: airdrop.name,
                symbol: airdrop.symbol || airdrop.name.substring(0, 4).toUpperCase(),
                logoUrl: '/placeholder-logo.png',
                description: airdrop.description,
                network: airdrop.network,
                status: dropStatus,
                claimUrl: airdrop.claimUrl,
                estValueUSD: airdrop.estValueUSD || 0,
                claimStartDate: airdrop.claimStartDate ? new Date(airdrop.claimStartDate) : null,
                claimEndDate: airdrop.claimEndDate ? new Date(airdrop.claimEndDate) : null,
                officialWebsite: airdrop.officialWebsite,
                twitterHandle: airdrop.twitterHandle,
                discordUrl: airdrop.discordUrl,
                telegramUrl: airdrop.telegramUrl,
                isVerified: airdrop.isVerified || false,
                riskLevel: riskLevel,
                sourceId: sourceRecord.id,
              },
            })

            newDrops++
          } catch (dropError) {
            console.error(`Error processing airdrop ${airdrop.name}:`, dropError)
          }
        }
      }

      // Update fetch log
      await prisma.fetchLog.update({
        where: { id: log.id },
        data: {
          finishedAt: new Date(),
          newDrops: newDrops,
          updatedDrops: 0,
        },
      })

      logs.push({
        source: aggregator.name,
        newDrops: newDrops,
      })
    } catch (error: any) {
      logs.push({
        source: aggregator.name,
        newDrops: 0,
        errors: error.message || String(error),
      })
    }
  }

  return logs
}

function mapStatusToEnum(status: string): DropStatus {
  const statusMap: Record<string, DropStatus> = {
    'upcoming': DropStatus.UPCOMING,
    'active': DropStatus.ACTIVE,
    'claimed': DropStatus.CLAIMED,
    'expired': DropStatus.EXPIRED,
    'cancelled': DropStatus.CANCELLED,
    'live': DropStatus.ACTIVE,
    'ended': DropStatus.EXPIRED,
  }
  
  return statusMap[status.toLowerCase()] || DropStatus.UPCOMING
}

function mapRiskLevel(riskLevel: string): RiskLevel {
  const riskMap: Record<string, RiskLevel> = {
    'low': RiskLevel.LOW,
    'medium': RiskLevel.MEDIUM,
    'high': RiskLevel.HIGH,
    'unknown': RiskLevel.UNKNOWN,
  }
  
  return riskMap[riskLevel?.toLowerCase()] || RiskLevel.MEDIUM
}
