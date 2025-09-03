import { PrismaClient, DropStatus, SourceType } from '@prisma/client'

const prisma = new PrismaClient()

type RemoteDrop = {
  name: string
  symbol?: string
  logoUrl?: string
  claimUrl?: string
  status?: keyof typeof DropStatus
  estValueUSD?: number
}

const DEFAULT_SOURCES = [
  { name: 'airdrops-fyi', url: 'https://raw.githubusercontent.com/airdrops-fyi/registry/main/airdrops.json' },
  { name: 'degen-vc/airdrop-checkers', url: 'https://raw.githubusercontent.com/degen-vc/airdrop-checkers/main/airdrops.json' },
]

export async function fetchGitHubAirdrops() {
  const logs: { source: string; added: number; updated: number }[] = []
  for (const src of DEFAULT_SOURCES) {
    const sourceRecord = await prisma.source.upsert({
      where: { url: src.url },
      update: {},
      create: { name: src.name, url: src.url, type: SourceType.GITHUB },
    })
    const log = await prisma.fetchLog.create({ data: { sourceId: sourceRecord.id } })
    let added = 0
    let updated = 0
    try {
      const res = await fetch(src.url, { cache: 'no-store' })
      if (!res.ok) throw new Error(`Failed to fetch ${src.url}`)
      const json = (await res.json()) as RemoteDrop[]
      for (const item of json) {
        if (!item.name || !item.claimUrl) continue
        if (!isValidClaimUrl(item.claimUrl)) continue
        const existing = await prisma.drop.findUnique({ where: { claimUrl: item.claimUrl } })
        const data = {
          name: item.name,
          symbol: item.symbol ?? '',
          logoUrl: item.logoUrl ?? '/placeholder-logo.png',
          status: (item.status as DropStatus) ?? DropStatus.UPCOMING,
          claimUrl: item.claimUrl,
          estValueUSD: item.estValueUSD ?? 0,
          sourceId: sourceRecord.id,
        }
        if (existing) {
          await prisma.drop.update({ where: { id: existing.id }, data })
          updated++
        } else {
          await prisma.drop.create({ data })
          added++
        }
      }
      await prisma.fetchLog.update({ where: { id: log.id }, data: { finishedAt: new Date(), newDrops: added, updatedDrops: updated } })
      logs.push({ source: src.name, added, updated })
    } catch (e: any) {
      await prisma.fetchLog.update({ where: { id: log.id }, data: { finishedAt: new Date(), errors: String(e?.message ?? e) } })
    }
  }
  return logs
}

export function isValidClaimUrl(url: string) {
  try {
    const u = new URL(url)
    const host = u.hostname
    return (
      host.endsWith('github.com') ||
      host.endsWith('githubusercontent.com') ||
      host.endsWith('foundation') ||
      host.endsWith('io') ||
      host.endsWith('org') ||
      host.endsWith('xyz')
    )
  } catch {
    return false
  }
}


