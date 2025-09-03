import { PrismaClient, DropStatus, SourceType, EligibilityStatus } from '@prisma/client'
import { Octokit } from '@octokit/rest'
import { isValidClaimUrl } from './github'
import { fetchFromAirdropAggregators } from './airdropAggregator'
import { crawlTwitterForAirdrops } from './twitterCrawler'
import { crawlCommunityLeaks } from './communityLeakCrawler'

const prisma = new PrismaClient()

type EligibilityData = {
  address: string
  valueUSD?: number
}

type RepositoryContent = {
  name: string
  path: string
  sha: string
  type: string
  url: string
  download_url: string | null
}

const GITHUB_REPOS = [
  { owner: 'airdrops-fyi', repo: 'registry' },
  { owner: 'degen-vc', repo: 'airdrop-checkers' },
]

export async function crawlGitHubRepositories() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  })

  const logs: { repo: string; files: number; addresses: number; errors?: string }[] = []

  for (const { owner, repo } of GITHUB_REPOS) {
    try {
      // Create or update source record
      const repoUrl = `https://github.com/${owner}/${repo}`
      const sourceRecord = await prisma.source.upsert({
        where: { url: repoUrl },
        update: { lastChecked: new Date() },
        create: { name: `${owner}/${repo}`, url: repoUrl, type: SourceType.GITHUB },
      })
      
      // Create fetch log
      const log = await prisma.fetchLog.create({ data: { sourceId: sourceRecord.id } })
      
      // Get repository contents
      const { data: contents } = await octokit.repos.getContent({
        owner,
        repo,
        path: '',
      })

      let filesProcessed = 0
      let addressesFound = 0

      // Process each file in the repository
      for (const item of Array.isArray(contents) ? contents : [contents]) {
        if (item.type === 'file' && isEligibilityFile(item.name)) {
          const { data: fileContent } = await octokit.request(item.download_url as string)
          
          // Extract project info and eligible addresses
          const { projectName, addresses } = parseEligibilityFile(item.name, fileContent)
          
          if (projectName && addresses.length > 0) {
            // Create or update drop
            const drop = await prisma.drop.upsert({
              where: { 
                name_symbol: {
                  name: projectName,
                  symbol: projectName.substring(0, 4).toUpperCase()
                }
              },
              update: {
                updatedAt: new Date(),
              },
              create: {
                name: projectName,
                symbol: projectName.substring(0, 4).toUpperCase(),
                logoUrl: '/placeholder-logo.png',
                status: DropStatus.UPCOMING,
                claimUrl: `${repoUrl}/blob/main/${item.path}`,
                estValueUSD: 0,
                sourceId: sourceRecord.id,
              },
            })

            // Process addresses in batches to avoid memory issues
            const batchSize = 100
            for (let i = 0; i < addresses.length; i += batchSize) {
              const batch = addresses.slice(i, i + batchSize)
              await Promise.all(
                batch.map(async (data) => {
                  await prisma.eligibility.upsert({
                    where: {
                      walletAddress_dropId: {
                        walletAddress: data.address,
                        dropId: drop.id,
                      },
                    },
                    update: {},
                    create: {
                      walletAddress: data.address,
                      dropId: drop.id,
                      valueUSD: data.valueUSD || 0,
                      status: EligibilityStatus.ELIGIBLE,
                    },
                  })
                })
              )
            }

            filesProcessed++
            addressesFound += addresses.length
          }
        }
      }

      // Update fetch log
      await prisma.fetchLog.update({
        where: { id: log.id },
        data: {
          finishedAt: new Date(),
          newDrops: filesProcessed,
          updatedDrops: 0,
        },
      })

      logs.push({
        repo: `${owner}/${repo}`,
        files: filesProcessed,
        addresses: addressesFound,
      })
    } catch (e: any) {
      logs.push({
        repo: `${owner}/${repo}`,
        files: 0,
        addresses: 0,
        errors: e.message || String(e),
      })
    }
  }

  return logs
}

// Main orchestrator function that runs all data sources
export async function fetchAllAirdropData() {
  console.log('Starting comprehensive airdrop data fetch...')
  
  const allLogs: { source: string; type: string; newDrops: number; errors?: string }[] = []
  
  try {
    // 1. Fetch from GitHub repositories
    console.log('Fetching from GitHub repositories...')
    const githubLogs = await crawlGitHubRepositories()
    allLogs.push(...githubLogs.map(log => ({ ...log, type: 'GitHub' })))
    
    // 2. Fetch from airdrop aggregators
    console.log('Fetching from airdrop aggregators...')
    const aggregatorLogs = await fetchFromAirdropAggregators()
    allLogs.push(...aggregatorLogs.map(log => ({ ...log, type: 'Aggregator' })))
    
    // 3. Crawl Twitter for airdrop announcements
    console.log('Crawling Twitter for airdrop announcements...')
    const twitterLogs = await crawlTwitterForAirdrops()
    allLogs.push(...twitterLogs.map(log => ({ ...log, type: 'Twitter' })))
    
    // 4. Crawl community leak sources
    console.log('Crawling community leak sources...')
    const leakLogs = await crawlCommunityLeaks()
    allLogs.push(...leakLogs.map(log => ({ ...log, type: 'Community Leak' })))
    
    // 5. Update drop statuses based on dates
    console.log('Updating drop statuses...')
    await updateDropStatuses()
    
    // 6. Clean up old data
    console.log('Cleaning up old data...')
    await cleanupOldData()
    
    console.log('Airdrop data fetch completed successfully')
    return allLogs
    
  } catch (error: any) {
    console.error('Error in comprehensive airdrop data fetch:', error)
    allLogs.push({
      source: 'System',
      type: 'Error',
      newDrops: 0,
      errors: error.message || String(error)
    })
    return allLogs
  }
}

// Update drop statuses based on current date and claim dates
async function updateDropStatuses() {
  const now = new Date()
  
  // Update expired drops
  await prisma.drop.updateMany({
    where: {
      claimEndDate: {
        lt: now
      },
      status: {
        in: [DropStatus.UPCOMING, DropStatus.ACTIVE]
      }
    },
    data: {
      status: DropStatus.EXPIRED,
      updatedAt: now
    }
  })
  
  // Update active drops (claim period started)
  await prisma.drop.updateMany({
    where: {
      claimStartDate: {
        lte: now
      },
      claimEndDate: {
        gt: now
      },
      status: DropStatus.UPCOMING
    },
    data: {
      status: DropStatus.ACTIVE,
      updatedAt: now
    }
  })
}

// Clean up old data to keep database size manageable
async function cleanupOldData() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  // Clean up old fetch logs
  await prisma.fetchLog.deleteMany({
    where: {
      startedAt: {
        lt: thirtyDaysAgo
      }
    }
  })
  
  // Clean up old feed events
  await prisma.feedEvent.deleteMany({
    where: {
      createdAt: {
        lt: thirtyDaysAgo
      }
    }
  })
  
  // Clean up old eligibility cache entries
  await prisma.eligibilityCache.deleteMany({
    where: {
      checkedAt: {
        lt: thirtyDaysAgo
      }
    }
  })
}

function isEligibilityFile(filename: string): boolean {
  const lowerName = filename.toLowerCase()
  return (
    lowerName.includes('eligib') ||
    lowerName.includes('airdrop') ||
    lowerName.endsWith('.json') ||
    lowerName.endsWith('.csv')
  )
}

function parseEligibilityFile(
  filename: string,
  content: any
): { projectName: string; addresses: EligibilityData[] } {
  const projectName = extractProjectName(filename)
  let addresses: EligibilityData[] = []

  try {
    if (typeof content === 'string') {
      // Try to parse as JSON
      try {
        const jsonData = JSON.parse(content)
        addresses = parseJsonAddresses(jsonData)
      } catch {
        // If not JSON, try CSV
        if (filename.toLowerCase().endsWith('.csv')) {
          addresses = parseCsvAddresses(content)
        } else {
          // Try to extract addresses from plain text
          addresses = extractAddressesFromText(content)
        }
      }
    } else if (typeof content === 'object') {
      // Already parsed JSON
      addresses = parseJsonAddresses(content)
    }
  } catch (error) {
    console.error(`Error parsing file ${filename}:`, error)
  }

  return { projectName, addresses }
}

function extractProjectName(filename: string): string {
  // Remove extension and common prefixes/suffixes
  const name = filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
    .replace(/eligib(le|ility)/i, '') // Remove eligibility variations
    .replace(/airdrop/i, '') // Remove airdrop
    .replace(/addresses/i, '') // Remove addresses
    .replace(/list/i, '') // Remove list
    .trim()

  // If name is empty after cleaning, use the original filename without extension
  return name || filename.replace(/\.[^/.]+$/, '')
}

function parseJsonAddresses(jsonData: any): EligibilityData[] {
  const addresses: EligibilityData[] = []

  // Handle array of strings (simple address list)
  if (Array.isArray(jsonData)) {
    jsonData.forEach((item) => {
      if (typeof item === 'string' && isValidAddress(item)) {
        addresses.push({ address: item.toLowerCase() })
      } else if (typeof item === 'object' && item !== null) {
        // Look for address field in object
        const address = findAddressInObject(item)
        if (address) {
          const valueUSD = findValueInObject(item)
          addresses.push({ address: address.toLowerCase(), valueUSD })
        }
      }
    })
  } else if (typeof jsonData === 'object' && jsonData !== null) {
    // Handle object with addresses as keys or in nested structure
    Object.keys(jsonData).forEach((key) => {
      if (isValidAddress(key)) {
        // Keys are addresses
        const value = jsonData[key]
        const valueUSD = typeof value === 'number' ? value : undefined
        addresses.push({ address: key.toLowerCase(), valueUSD })
      } else if (typeof jsonData[key] === 'object' && jsonData[key] !== null) {
        // Look for addresses in nested objects
        if (Array.isArray(jsonData[key])) {
          jsonData[key].forEach((item: any) => {
            if (typeof item === 'string' && isValidAddress(item)) {
              addresses.push({ address: item.toLowerCase() })
            } else if (typeof item === 'object' && item !== null) {
              const address = findAddressInObject(item)
              if (address) {
                const valueUSD = findValueInObject(item)
                addresses.push({ address: address.toLowerCase(), valueUSD })
              }
            }
          })
        } else {
          const address = findAddressInObject(jsonData[key])
          if (address) {
            const valueUSD = findValueInObject(jsonData[key])
            addresses.push({ address: address.toLowerCase(), valueUSD })
          }
        }
      }
    })
  }

  return addresses
}

function parseCsvAddresses(csvContent: string): EligibilityData[] {
  const addresses: EligibilityData[] = []
  const lines = csvContent.split('\n')

  // Try to determine if there's a header
  const hasHeader = lines.length > 0 && !isValidAddress(lines[0].split(',')[0].trim())
  const startIndex = hasHeader ? 1 : 0

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = line.split(',')
    for (const part of parts) {
      const trimmed = part.trim()
      if (isValidAddress(trimmed)) {
        // Try to find a value in another column
        const valueColumn = parts.find(p => {
          const num = parseFloat(p.trim())
          return !isNaN(num) && isFinite(num)
        })
        
        const valueUSD = valueColumn ? parseFloat(valueColumn) : undefined
        addresses.push({ address: trimmed.toLowerCase(), valueUSD })
        break // Found an address in this line, move to next line
      }
    }
  }

  return addresses
}

function extractAddressesFromText(text: string): EligibilityData[] {
  const addresses: EligibilityData[] = []
  
  // Match Ethereum addresses (0x followed by 40 hex chars)
  const ethRegex = /0x[a-fA-F0-9]{40}/g
  let match
  
  while ((match = ethRegex.exec(text)) !== null) {
    addresses.push({ address: match[0].toLowerCase() })
  }
  
  return addresses
}

function findAddressInObject(obj: any): string | null {
  const addressFields = ['address', 'addr', 'wallet', 'walletAddress', 'account', 'recipient']
  
  for (const field of addressFields) {
    if (obj[field] && typeof obj[field] === 'string' && isValidAddress(obj[field])) {
      return obj[field]
    }
  }
  
  // Check any field that might contain an address
  for (const key in obj) {
    if (typeof obj[key] === 'string' && isValidAddress(obj[key])) {
      return obj[key]
    }
  }
  
  return null
}

function findValueInObject(obj: any): number | undefined {
  const valueFields = ['value', 'amount', 'valueUSD', 'amountUSD', 'usd', 'worth', 'reward']
  
  for (const field of valueFields) {
    if (obj[field] !== undefined) {
      const value = parseFloat(obj[field])
      if (!isNaN(value) && isFinite(value)) {
        return value
      }
    }
  }
  
  return undefined
}

function isValidAddress(address: string): boolean {
  // Basic validation for Ethereum addresses
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return true
  }
  
  // Basic validation for Solana addresses (base58, 32-44 chars)
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return true
  }
  
  // Basic validation for Cosmos addresses (typically start with specific prefixes)
  if (/^(cosmos|osmo|juno|stars|axl)[a-zA-Z0-9]{39,59}$/.test(address)) {
    return true
  }
  
  // Basic validation for Tron addresses (start with T, 34 chars)
  if (/^T[a-zA-Z0-9]{33}$/.test(address)) {
    return true
  }
  
  return false
}