import { PrismaClient, DropStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Seed admin user
  const email = process.env.ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.ADMIN_PASSWORD || 'change-this-password'
  const hash = await bcrypt.hash(password, 10)
  await prisma.user.upsert({
    where: { email },
    update: { password: hash },
    create: { email, password: hash },
  })
  // Upsert example drops
  await prisma.drop.upsert({
    where: { id: 'seed-arbitrum' },
    update: {},
    create: {
      id: 'seed-arbitrum',
      name: 'Arbitrum',
      symbol: 'ARB',
      logoUrl: '/arbitrum-logo-abstract.png',
      claimUrl: 'https://arbitrum.foundation/airdrop',
      estValueUSD: 120,
      status: DropStatus.UNCLAIMED,
    },
  })

  // Seed a few live feed events if none exist
  const feedCount = await prisma.feedEvent.count()
  if (feedCount === 0) {
    await prisma.feedEvent.createMany({
      data: [
        { address: '0x1234...abcd', message: 'claimed $320 from Optimism', valueUSD: 320 },
        { address: '0x9fA1...BEEf', message: 'claimed $150 from Arbitrum', valueUSD: 150 },
        { address: '0xDeAd...BEEF', message: 'claimed $90 from zkSync', valueUSD: 90 },
      ],
      skipDuplicates: true,
    })
  }

  await prisma.drop.upsert({
    where: { id: 'seed-optimism' },
    update: {},
    create: {
      id: 'seed-optimism',
      name: 'Optimism',
      symbol: 'OP',
      logoUrl: '/optimism-logo-abstract.png',
      claimUrl: 'https://app.optimism.io/airdrop',
      estValueUSD: 80,
      status: DropStatus.UNCLAIMED,
    },
  })

  await prisma.drop.upsert({
    where: { id: 'seed-starknet' },
    update: {},
    create: {
      id: 'seed-starknet',
      name: 'Starknet',
      symbol: 'STRK',
      logoUrl: '/starknet-logo.png',
      claimUrl: 'https://starknet.io/airdrop',
      estValueUSD: 50,
      status: DropStatus.UPCOMING,
    },
  })

  await prisma.drop.upsert({
    where: { id: 'seed-zksync' },
    update: {},
    create: {
      id: 'seed-zksync',
      name: 'zkSync',
      symbol: 'ZK',
      logoUrl: '/zksync-logo.png',
      claimUrl: 'https://claim.zknation.io/',
      estValueUSD: 0,
      status: DropStatus.EXPIRED,
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })


