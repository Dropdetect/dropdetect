import { NextRequest, NextResponse } from 'next/server'
import { fetchAllAirdropData } from '@/src/server/fetchers/githubCrawler'

export const dynamic = 'force-dynamic'

// This endpoint is designed to be called by Vercel Cron
export async function GET(req: NextRequest) {
  // Verify the request is coming from Vercel Cron
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    console.log('Starting daily airdrop data fetch...')
    const logs = await fetchAllAirdropData()
    
    const totalNewDrops = logs.reduce((sum, log) => sum + log.newDrops, 0)
    const totalErrors = logs.filter(log => log.errors).length
    
    console.log(`Daily fetch completed: ${totalNewDrops} new drops, ${totalErrors} errors`)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalNewDrops,
        totalErrors,
        sourcesProcessed: logs.length
      },
      logs,
    })
  } catch (error: any) {
    console.error('Error in cron job fetching drops:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch drops', 
        message: error.message || String(error),
      },
      { status: 500 }
    )
  }
}