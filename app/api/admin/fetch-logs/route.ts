import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/server/db'
import { requireAdmin } from '@/src/server/auth'

export async function GET(req: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin()
    
    // Fetch recent fetch logs
    const logs = await prisma.fetchLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        source: true
      }
    })
    
    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: 'Unauthorized or error fetching logs' },
      { status: 401 }
    )
  }
}