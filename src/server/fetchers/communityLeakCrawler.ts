import { PrismaClient, SourceType, DropStatus, RiskLevel } from '@prisma/client'
import axios from 'axios'
import * as cheerio from 'cheerio'

const prisma = new PrismaClient()

interface LeakData {
  name: string
  symbol?: string
  description?: string
  network?: string
  claimUrl?: string
  estValueUSD?: number
  source: string
  confidence: number // 0-100
}

const COMMUNITY_SOURCES = [
  {
    name: 'DeFiLlama Airdrops',
    url: 'https://defillama.com/airdrops',
    type: 'scrape'
  },
  {
    name: 'CoinGecko Airdrops',
    url: 'https://www.coingecko.com/en/airdrops',
    type: 'scrape'
  },
  {
    name: 'AirdropBob',
    url: 'https://airdropbob.com/',
    type: 'scrape'
  },
  {
    name: 'AirdropAlert',
    url: 'https://airdropalert.com/',
    type: 'scrape'
  }
]

export async function crawlCommunityLeaks() {
  const logs: { source: string; newDrops: number; errors?: string }[] = []

  for (const source of COMMUNITY_SOURCES) {
    try {
      // Create or update source record
      const sourceRecord = await prisma.source.upsert({
        where: { url: source.url },
        update: { lastChecked: new Date() },
        create: { 
          name: source.name, 
          url: source.url, 
          type: SourceType.COMMUNITY_LEAK,
          lastChecked: new Date()
        },
      })

      // Create fetch log
      const log = await prisma.fetchLog.create({ 
        data: { 
          sourceId: sourceRecord.id,
          metadata: { source: source.name, type: source.type }
        } 
      })

      let newDrops = 0

      if (source.type === 'scrape') {
        const response = await axios.get(source.url, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })

        const $ = cheerio.load(response.data)
        const leakData = extractAirdropsFromHTML($, source.name)

        for (const leak of leakData) {
          try {
            await prisma.drop.upsert({
              where: { 
                name_symbol: {
                  name: leak.name,
                  symbol: leak.symbol || leak.name.substring(0, 4).toUpperCase()
                }
              },
              update: {
                description: leak.description,
                network: leak.network,
                claimUrl: leak.claimUrl,
                estValueUSD: leak.estValueUSD || 0,
                updatedAt: new Date(),
              },
              create: {
                name: leak.name,
                symbol: leak.symbol || leak.name.substring(0, 4).toUpperCase(),
                logoUrl: '/placeholder-logo.png',
                description: leak.description,
                network: leak.network,
                status: DropStatus.UPCOMING,
                claimUrl: leak.claimUrl,
                estValueUSD: leak.estValueUSD || 0,
                isVerified: false,
                riskLevel: RiskLevel.HIGH, // Community leaks are higher risk
                sourceId: sourceRecord.id,
              },
            })

            newDrops++
          } catch (dropError) {
            console.error(`Error processing leak ${leak.name}:`, dropError)
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
        source: source.name,
        newDrops: newDrops,
      })
    } catch (error: any) {
      logs.push({
        source: source.name,
        newDrops: 0,
        errors: error.message || String(error),
      })
    }
  }

  return logs
}

function extractAirdropsFromHTML($: cheerio.CheerioAPI, sourceName: string): LeakData[] {
  const leaks: LeakData[] = []

  // DeFiLlama specific extraction
  if (sourceName.includes('DeFiLlama')) {
    $('.airdrop-item, .project-item, [class*="airdrop"]').each((_, element) => {
      const $el = $(element)
      const name = $el.find('h3, h4, .name, .title').first().text().trim()
      const description = $el.find('.description, .desc, p').first().text().trim()
      const claimUrl = $el.find('a[href*="claim"], a[href*="app"]').attr('href')
      const valueText = $el.find('.value, .amount, [class*="value"]').text()
      const valueMatch = valueText.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/)
      const estValueUSD = valueMatch ? parseFloat(valueMatch[1].replace(/,/g, '')) : undefined

      if (name && name.length > 2) {
        leaks.push({
          name,
          description,
          claimUrl,
          estValueUSD,
          source: sourceName,
          confidence: 70
        })
      }
    })
  }

  // CoinGecko specific extraction
  if (sourceName.includes('CoinGecko')) {
    $('.airdrop-card, .project-card, [class*="airdrop"]').each((_, element) => {
      const $el = $(element)
      const name = $el.find('.name, .title, h3, h4').first().text().trim()
      const description = $el.find('.description, .desc').first().text().trim()
      const claimUrl = $el.find('a[href*="claim"], a[href*="app"]').attr('href')
      const valueText = $el.find('.value, .price, [class*="value"]').text()
      const valueMatch = valueText.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/)
      const estValueUSD = valueMatch ? parseFloat(valueMatch[1].replace(/,/g, '')) : undefined

      if (name && name.length > 2) {
        leaks.push({
          name,
          description,
          claimUrl,
          estValueUSD,
          source: sourceName,
          confidence: 75
        })
      }
    })
  }

  // Generic extraction for other sources
  $('[class*="airdrop"], [class*="project"], .card, .item').each((_, element) => {
    const $el = $(element)
    const name = $el.find('h1, h2, h3, h4, h5, h6, .name, .title, .project-name').first().text().trim()
    
    if (name && name.length > 2 && name.length < 50) {
      const description = $el.find('.description, .desc, .summary, p').first().text().trim()
      const claimUrl = $el.find('a[href*="claim"], a[href*="app"], a[href*="portal"]').attr('href')
      const valueText = $el.find('.value, .amount, .price, [class*="value"], [class*="amount"]').text()
      const valueMatch = valueText.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/)
      const estValueUSD = valueMatch ? parseFloat(valueMatch[1].replace(/,/g, '')) : undefined

      // Extract network from text
      const networkMatch = $el.text().match(/(ethereum|solana|polygon|arbitrum|optimism|base|avalanche|bsc|binance)/i)
      const network = networkMatch ? networkMatch[1].toLowerCase() : undefined

      leaks.push({
        name,
        description: description.length > 200 ? description.substring(0, 200) + '...' : description,
        claimUrl,
        estValueUSD,
        network,
        source: sourceName,
        confidence: 60
      })
    }
  })

  // Remove duplicates and filter by confidence
  const uniqueLeaks = leaks.filter((leak, index, self) => 
    index === self.findIndex(l => l.name.toLowerCase() === leak.name.toLowerCase())
  ).filter(leak => leak.confidence >= 60)

  return uniqueLeaks
}
