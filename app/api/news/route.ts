import { NextResponse } from 'next/server'
import { prisma } from '@/src/server/db'

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 12, // Limit to 12 most recent news items
      include: {
        drop: {
          select: {
            name: true,
            symbol: true,
            logoUrl: true
          }
        }
      }
    })

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
