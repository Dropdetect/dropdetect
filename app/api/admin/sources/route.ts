import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/server/db'
import { requireAdmin } from '@/src/server/auth'

export async function GET(req: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin()
    
    // Fetch all sources
    const sources = await prisma.source.findMany({
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(sources)
  } catch (error) {
    console.error('Error fetching sources:', error)
    return NextResponse.json(
      { error: 'Unauthorized or error fetching sources' },
      { status: 401 }
    )
  }
}