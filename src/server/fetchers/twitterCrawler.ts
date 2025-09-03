import { PrismaClient, SourceType, DropStatus, RiskLevel } from '@prisma/client'
import { TwitterApi } from 'twitter-api-v2'

const prisma = new PrismaClient()

interface TwitterAirdropData {
  name: string
  symbol?: string
  description?: string
  claimUrl?: string
  estValueUSD?: number
  network?: string
  officialWebsite?: string
  twitterHandle?: string
  discordUrl?: string
  telegramUrl?: string
}

const TWITTER_SOURCES = [
  {
    name: 'AirdropAlert',
    handle: '@AirdropAlert',
    keywords: ['airdrop', 'claim', 'eligible', 'snapshot']
  },
  {
    name: 'DeFiPulse',
    handle: '@defipulse',
    keywords: ['airdrop', 'token', 'launch', 'claim']
  },
  {
    name: 'CoinDesk',
    handle: '@coindesk',
    keywords: ['airdrop', 'token', 'launch']
  }
]

export async function crawlTwitterForAirdrops() {
  const logs: { source: string; newDrops: number; errors?: string }[] = []

  if (!process.env.TWITTER_BEARER_TOKEN) {
    console.warn('Twitter Bearer Token not configured, skipping Twitter crawl')
    return logs
  }

  const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN)

  for (const source of TWITTER_SOURCES) {
    try {
      // Create or update source record
      const sourceUrl = `https://twitter.com/${source.handle.replace('@', '')}`
      const sourceRecord = await prisma.source.upsert({
        where: { url: sourceUrl },
        update: { lastChecked: new Date() },
        create: { 
          name: source.name, 
          url: sourceUrl, 
          type: SourceType.TWITTER,
          lastChecked: new Date()
        },
      })

      // Create fetch log
      const log = await prisma.fetchLog.create({ 
        data: { 
          sourceId: sourceRecord.id,
          metadata: { handle: source.handle, keywords: source.keywords }
        } 
      })

      let newDrops = 0

      // Search for tweets from this account containing airdrop keywords
      for (const keyword of source.keywords) {
        try {
          const tweets = await twitterClient.v2.search({
            query: `from:${source.handle.replace('@', '')} ${keyword} -is:retweet`,
            max_results: 50,
            'tweet.fields': ['created_at', 'public_metrics', 'context_annotations'],
            'user.fields': ['verified']
          })

          for (const tweet of tweets.data.data || []) {
            const airdropData = extractAirdropFromTweet(tweet.text, source)
            
            if (airdropData) {
              try {
                await prisma.drop.upsert({
                  where: { 
                    name_symbol: {
                      name: airdropData.name,
                      symbol: airdropData.symbol || airdropData.name.substring(0, 4).toUpperCase()
                    }
                  },
                  update: {
                    description: airdropData.description,
                    network: airdropData.network,
                    claimUrl: airdropData.claimUrl,
                    estValueUSD: airdropData.estValueUSD || 0,
                    officialWebsite: airdropData.officialWebsite,
                    twitterHandle: airdropData.twitterHandle,
                    discordUrl: airdropData.discordUrl,
                    telegramUrl: airdropData.telegramUrl,
                    updatedAt: new Date(),
                  },
                  create: {
                    name: airdropData.name,
                    symbol: airdropData.symbol || airdropData.name.substring(0, 4).toUpperCase(),
                    logoUrl: '/placeholder-logo.png',
                    description: airdropData.description,
                    network: airdropData.network,
                    status: DropStatus.UPCOMING,
                    claimUrl: airdropData.claimUrl,
                    estValueUSD: airdropData.estValueUSD || 0,
                    officialWebsite: airdropData.officialWebsite,
                    twitterHandle: airdropData.twitterHandle,
                    discordUrl: airdropData.discordUrl,
                    telegramUrl: airdropData.telegramUrl,
                    isVerified: false,
                    riskLevel: RiskLevel.MEDIUM,
                    sourceId: sourceRecord.id,
                  },
                })

                newDrops++
              } catch (dropError) {
                console.error(`Error processing airdrop from tweet:`, dropError)
              }
            }
          }
        } catch (searchError) {
          console.error(`Error searching tweets for ${source.handle}:`, searchError)
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

function extractAirdropFromTweet(tweetText: string, source: any): TwitterAirdropData | null {
  // Extract project name (usually in quotes or after specific patterns)
  const nameMatch = tweetText.match(/(?:^|\s)["']([^"']+)["']|(?:^|\s)([A-Z][a-zA-Z0-9\s]+?)(?:\s+(?:airdrop|token|launch))/i)
  if (!nameMatch) return null

  const name = nameMatch[1] || nameMatch[2]
  if (!name || name.length < 2) return null

  // Extract URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls = tweetText.match(urlRegex) || []
  
  // Extract claim URL (usually contains 'claim' or specific patterns)
  const claimUrl = urls.find(url => 
    url.includes('claim') || 
    url.includes('airdrop') || 
    url.includes('app') ||
    url.includes('portal')
  )

  // Extract website URL
  const websiteUrl = urls.find(url => 
    !url.includes('twitter.com') && 
    !url.includes('t.co') &&
    !url.includes('claim') &&
    !url.includes('airdrop')
  )

  // Extract social media handles
  const discordMatch = tweetText.match(/discord\.gg\/[a-zA-Z0-9]+/i)
  const telegramMatch = tweetText.match(/t\.me\/[a-zA-Z0-9_]+/i)
  const twitterMatch = tweetText.match(/@[a-zA-Z0-9_]+/g)

  // Extract estimated value (look for $ amounts)
  const valueMatch = tweetText.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/)
  const estValueUSD = valueMatch ? parseFloat(valueMatch[1].replace(/,/g, '')) : undefined

  // Extract network/blockchain
  const networkMatch = tweetText.match(/(ethereum|solana|polygon|arbitrum|optimism|base|avalanche|bsc|binance)/i)
  const network = networkMatch ? networkMatch[1].toLowerCase() : undefined

  return {
    name: name.trim(),
    description: tweetText.length > 200 ? tweetText.substring(0, 200) + '...' : tweetText,
    claimUrl: claimUrl,
    estValueUSD: estValueUSD,
    network: network,
    officialWebsite: websiteUrl,
    discordUrl: discordMatch ? `https://${discordMatch[0]}` : undefined,
    telegramUrl: telegramMatch ? `https://${telegramMatch[0]}` : undefined,
    twitterHandle: twitterMatch ? twitterMatch[0] : undefined,
  }
}
