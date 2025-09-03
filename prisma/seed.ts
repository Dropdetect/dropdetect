import { PrismaClient, SourceType, DropStatus, RiskLevel, EligibilityStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')

  // Seed admin user
  const email = process.env.ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.ADMIN_PASSWORD || 'change-this-password'
  const hash = await bcrypt.hash(password, 10)
  await prisma.user.upsert({
    where: { email },
    update: { password: hash },
    create: { email, password: hash },
  })

  // Create system configuration
  await prisma.systemConfig.createMany({
    data: [
      { key: 'app_version', value: '1.0.0', type: 'string' },
      { key: 'last_data_fetch', value: new Date().toISOString(), type: 'string' },
      { key: 'total_drops', value: '0', type: 'number' },
      { key: 'total_eligible_addresses', value: '0', type: 'number' },
    ],
    skipDuplicates: true
  })

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: { name: 'Layer 2', color: '#8B5CF6' }
    }),
    prisma.tag.create({
      data: { name: 'DeFi', color: '#10B981' }
    }),
    prisma.tag.create({
      data: { name: 'NFT', color: '#F59E0B' }
    }),
    prisma.tag.create({
      data: { name: 'Gaming', color: '#EF4444' }
    }),
    prisma.tag.create({
      data: { name: 'Infrastructure', color: '#3B82F6' }
    }),
    prisma.tag.create({
      data: { name: 'Verified', color: '#10B981' }
    }),
  ])

  // Create sources
  const sources = await Promise.all([
    prisma.source.create({
      data: {
        name: 'GitHub - airdrops-fyi/registry',
        url: 'https://github.com/airdrops-fyi/registry',
        type: SourceType.GITHUB,
        isActive: true,
        checkInterval: 24
      }
    }),
    prisma.source.create({
      data: {
        name: 'GitHub - degen-vc/airdrop-checkers',
        url: 'https://github.com/degen-vc/airdrop-checkers',
        type: SourceType.GITHUB,
        isActive: true,
        checkInterval: 24
      }
    }),
    prisma.source.create({
      data: {
        name: 'AirdropAlert API',
        url: 'https://airdropalert.com/api/v1/airdrops',
        type: SourceType.AIRDROP_AGGREGATOR,
        isActive: true,
        checkInterval: 12
      }
    }),
    prisma.source.create({
      data: {
        name: 'Twitter - @AirdropAlert',
        url: 'https://twitter.com/AirdropAlert',
        type: SourceType.TWITTER,
        isActive: true,
        checkInterval: 6
      }
    }),
  ])

  // Create sample drops with comprehensive data
  const drops = await Promise.all([
    prisma.drop.create({
      data: {
        name: 'Starknet',
        symbol: 'STRK',
        logoUrl: '/starknet-logo.png',
        status: DropStatus.ACTIVE,
        claimUrl: 'https://starknet.io/claim',
        estValueUSD: 450,
        description: 'Starknet is a permissionless decentralized ZK-Rollup operating as an L2 network over Ethereum, enabling dApps to achieve unlimited scale for its computation, without compromising Ethereum\'s composability and security.',
        network: 'Ethereum',
        tokenAddress: '0xca1422a1c9c4a7c8b8b8b8b8b8b8b8b8b8b8b8b8',
        totalSupply: 10000000000,
        airdropSupply: 1800000000,
        snapshotDate: new Date('2024-01-01'),
        claimStartDate: new Date('2024-02-20'),
        claimEndDate: new Date('2024-06-20'),
        eligibilityCriteria: 'Early users, developers, and contributors to the Starknet ecosystem',
        officialWebsite: 'https://starknet.io',
        twitterHandle: '@StarknetEco',
        discordUrl: 'https://discord.gg/starknet',
        isVerified: true,
        riskLevel: RiskLevel.LOW,
        sourceId: sources[0].id,
        tags: {
          create: [
            { tagId: tags[0].id }, // Layer 2
            { tagId: tags[1].id }, // DeFi
            { tagId: tags[5].id }, // Verified
          ]
        }
      },
    }),
    prisma.drop.create({
      data: {
        name: 'ZKSync',
        symbol: 'ZK',
        logoUrl: '/zksync-logo.png',
        status: DropStatus.UPCOMING,
        claimUrl: 'https://zksync.io/claim',
        estValueUSD: 320,
        description: 'zkSync is a Layer 2 protocol that scales Ethereum with cutting-edge ZK tech. It\'s trustless, secure, user-friendly, and EVM-compatible.',
        network: 'Ethereum',
        tokenAddress: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
        totalSupply: 21000000000,
        airdropSupply: 1750000000,
        snapshotDate: new Date('2024-01-01'),
        claimStartDate: new Date('2024-03-01'),
        claimEndDate: new Date('2024-07-01'),
        eligibilityCriteria: 'Users who bridged assets, used dApps, or provided liquidity on zkSync Era',
        officialWebsite: 'https://zksync.io',
        twitterHandle: '@zksync',
        discordUrl: 'https://discord.gg/zksync',
        isVerified: true,
        riskLevel: RiskLevel.LOW,
        sourceId: sources[1].id,
        tags: {
          create: [
            { tagId: tags[0].id }, // Layer 2
            { tagId: tags[4].id }, // Infrastructure
            { tagId: tags[5].id }, // Verified
          ]
        }
      },
    }),
    prisma.drop.create({
      data: {
        name: 'LayerZero',
        symbol: 'ZRO',
        logoUrl: '/layerzero-logo.jpg',
        status: DropStatus.ACTIVE,
        claimUrl: 'https://layerzero.network/claim',
        estValueUSD: 280,
        description: 'LayerZero is an omnichain interoperability protocol that enables lightweight message passing across chains.',
        network: 'Multi-chain',
        tokenAddress: '0x5a98fcbea516cf06857215779fd812ca3bef1b32',
        totalSupply: 1000000000,
        airdropSupply: 230000000,
        snapshotDate: new Date('2024-01-01'),
        claimStartDate: new Date('2024-02-15'),
        claimEndDate: new Date('2024-05-15'),
        eligibilityCriteria: 'Users who bridged assets across chains using LayerZero protocol',
        officialWebsite: 'https://layerzero.network',
        twitterHandle: '@LayerZero_Labs',
        discordUrl: 'https://discord.gg/layerzero',
        isVerified: true,
        riskLevel: RiskLevel.LOW,
        sourceId: sources[2].id,
        tags: {
          create: [
            { tagId: tags[1].id }, // DeFi
            { tagId: tags[4].id }, // Infrastructure
            { tagId: tags[5].id }, // Verified
          ]
        }
      },
    }),
    prisma.drop.create({
      data: {
        name: 'Blast',
        symbol: 'BLAST',
        logoUrl: '/placeholder-logo.png',
        status: DropStatus.UPCOMING,
        claimUrl: 'https://blast.io/claim',
        estValueUSD: 350,
        description: 'Blast is the only Ethereum L2 with native yield for ETH and stablecoins.',
        network: 'Ethereum',
        totalSupply: 10000000000,
        airdropSupply: 1700000000,
        snapshotDate: new Date('2024-02-01'),
        claimStartDate: new Date('2024-04-01'),
        claimEndDate: new Date('2024-08-01'),
        eligibilityCriteria: 'Users who deposited ETH or stablecoins on Blast L2',
        officialWebsite: 'https://blast.io',
        twitterHandle: '@Blast_L2',
        discordUrl: 'https://discord.gg/blast',
        isVerified: true,
        riskLevel: RiskLevel.MEDIUM,
        sourceId: sources[3].id,
        tags: {
          create: [
            { tagId: tags[0].id }, // Layer 2
            { tagId: tags[1].id }, // DeFi
            { tagId: tags[5].id }, // Verified
          ]
        }
      },
    }),
    prisma.drop.create({
      data: {
        name: 'Base',
        symbol: 'BASE',
        logoUrl: '/placeholder-logo.png',
        status: DropStatus.UPCOMING,
        claimUrl: 'https://base.org/claim',
        estValueUSD: 250,
        description: 'Base is a secure, low-cost, builder-friendly Ethereum L2 built to bring the next billion users onchain.',
        network: 'Ethereum',
        totalSupply: 10000000000,
        airdropSupply: 1000000000,
        snapshotDate: new Date('2024-01-01'),
        claimStartDate: new Date('2024-05-01'),
        claimEndDate: new Date('2024-09-01'),
        eligibilityCriteria: 'Users who used Base network and Coinbase products',
        officialWebsite: 'https://base.org',
        twitterHandle: '@base',
        discordUrl: 'https://discord.gg/base',
        isVerified: true,
        riskLevel: RiskLevel.LOW,
        sourceId: sources[0].id,
        tags: {
          create: [
            { tagId: tags[0].id }, // Layer 2
            { tagId: tags[4].id }, // Infrastructure
            { tagId: tags[5].id }, // Verified
          ]
        }
      },
    }),
  ])

  // Create sample news items
  await Promise.all([
    prisma.news.create({
      data: {
        title: 'Starknet Airdrop Goes Live - $450M Worth of STRK Tokens',
        content: 'The highly anticipated Starknet airdrop is now live! Eligible users can claim their STRK tokens worth an estimated $450 each. The airdrop includes 1.8B STRK tokens for early users, developers, and contributors.',
        url: 'https://starknet.io/blog/starknet-airdrop-live',
        source: 'Official',
        publishedAt: new Date('2024-02-20'),
        isBreaking: true,
        dropId: drops[0].id
      }
    }),
    prisma.news.create({
      data: {
        title: 'zkSync Era Airdrop Snapshot Completed',
        content: 'zkSync Era has completed its airdrop snapshot on January 1st, 2024. Users who bridged assets, used dApps, or provided liquidity are eligible for the upcoming ZK token airdrop.',
        url: 'https://zksync.io/blog/airdrop-snapshot-complete',
        source: 'Official',
        publishedAt: new Date('2024-01-02'),
        isBreaking: false,
        dropId: drops[1].id
      }
    }),
    prisma.news.create({
      data: {
        title: 'LayerZero ZRO Token Launch and Airdrop Details',
        content: 'LayerZero has announced the launch of their ZRO token with an airdrop for users who bridged assets across chains. The airdrop includes 230M ZRO tokens.',
        url: 'https://layerzero.network/blog/zro-token-launch',
        source: 'Official',
        publishedAt: new Date('2024-02-15'),
        isBreaking: true,
        dropId: drops[2].id
      }
    }),
  ])

  // Create sample feed events
  await Promise.all([
    prisma.feedEvent.create({
      data: {
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        message: 'Claimed Starknet airdrop worth $450',
        valueUSD: 450,
        dropName: 'Starknet',
        createdAt: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
      }
    }),
    prisma.feedEvent.create({
      data: {
        address: '0x8ba1f109551bD432803012645Hac136c',
        message: 'Claimed LayerZero airdrop worth $280',
        valueUSD: 280,
        dropName: 'LayerZero',
        createdAt: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
      }
    }),
    prisma.feedEvent.create({
      data: {
        address: '0x1234567890123456789012345678901234567890',
        message: 'Claimed zkSync airdrop worth $320',
        valueUSD: 320,
        dropName: 'zkSync',
        createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      }
    }),
  ])

  // Create sample banners
  await Promise.all([
    prisma.banner.create({
      data: {
        imageUrl: '/banner-starknet.jpg',
        linkUrl: 'https://starknet.io/claim',
        title: 'Starknet Airdrop Live!',
        description: 'Claim your STRK tokens now - worth up to $450',
        active: true,
        priority: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    }),
    prisma.banner.create({
      data: {
        imageUrl: '/banner-layerzero.jpg',
        linkUrl: 'https://layerzero.network/claim',
        title: 'LayerZero ZRO Airdrop',
        description: 'Don\'t miss out on the ZRO token airdrop',
        active: true,
        priority: 8,
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
      }
    }),
  ])

  // Create sample airdrop checkers
  await Promise.all([
    prisma.airdropChecker.create({
      data: {
        name: 'AirdropAlert Checker',
        url: 'https://airdropalert.com/checker',
        isActive: true,
        successRate: 95
      }
    }),
    prisma.airdropChecker.create({
      data: {
        name: 'CoinAirdrops Checker',
        url: 'https://coinairdrops.com/checker',
        isActive: true,
        successRate: 88
      }
    }),
  ])

  console.log('Database seeding completed successfully!')
  console.log(`Created ${drops.length} drops, ${tags.length} tags, ${sources.length} sources`)
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })