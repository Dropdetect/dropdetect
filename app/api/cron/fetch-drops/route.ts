import { NextRequest, NextResponse } from 'next/server'
import { crawlGitHubRepositories } from '@/src/server/fetchers/githubCrawler'

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
    const logs = await crawlGitHubRepositories()
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
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