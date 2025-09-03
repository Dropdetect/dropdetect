import { PrismaClient, DropStatus, SourceType, EligibilityStatus } from '@prisma/client'
import fs from 'fs'
import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import path from 'path'

const prisma = new PrismaClient()

/**
 * Process a large Linea eligibility list file
 * This function uses streaming to handle large files efficiently
 */
export async function processLineaEligibilityList(filePath: string) {
  // Validate file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }

  // Create source record for Linea
  const sourceRecord = await prisma.source.upsert({
    where: { url: 'https://linea.build' },
    update: {},
    create: {
      name: 'Linea Eligibility List',
      url: 'https://linea.build',
      type: SourceType.MANUAL,
    },
  })

  // Create fetch log
  const log = await prisma.fetchLog.create({ data: { sourceId: sourceRecord.id } })

  // Create or update Linea drop
  const drop = await prisma.drop.upsert({
    where: { claimUrl: 'https://linea.build/airdrop' },
    update: {
      updatedAt: new Date(),
    },
    create: {
      name: 'Linea',
      symbol: 'LINE',
      logoUrl: '/linea-logo.png', // Placeholder, should be updated with actual logo
      status: DropStatus.UNCLAIMED,
      claimUrl: 'https://linea.build/airdrop',
      estValueUSD: 500, // Estimated value, should be updated with actual value
      sourceId: sourceRecord.id,
    },
  })

  // Process the file using streams to handle large files
  const fileStream = createReadStream(filePath)
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  })

  let addressCount = 0
  const batchSize = 100
  let batch: string[] = []

  for await (const line of rl) {
    const trimmedLine = line.trim()
    if (trimmedLine && isValidEthereumAddress(trimmedLine)) {
      batch.push(trimmedLine.toLowerCase())
      
      if (batch.length >= batchSize) {
        await processBatch(batch, drop.id)
        addressCount += batch.length
        batch = []
      }
    }
  }

  // Process any remaining addresses in the last batch
  if (batch.length > 0) {
    await processBatch(batch, drop.id)
    addressCount += batch.length
  }

  // Update fetch log
  await prisma.fetchLog.update({
    where: { id: log.id },
    data: {
      finishedAt: new Date(),
      newDrops: 1,
      updatedDrops: 0,
    },
  })

  return {
    dropName: drop.name,
    addressesProcessed: addressCount,
  }
}

async function processBatch(addresses: string[], dropId: string) {
  await Promise.all(
    addresses.map(async (address) => {
      await prisma.eligibility.upsert({
        where: {
          walletAddress_dropId: {
            walletAddress: address,
            dropId: dropId,
          },
        },
        update: {},
        create: {
          walletAddress: address,
          dropId: dropId,
          valueUSD: 500, // Estimated value for Linea airdrop
          status: EligibilityStatus.ELIGIBLE,
        },
      })
    })
  )
}

function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}