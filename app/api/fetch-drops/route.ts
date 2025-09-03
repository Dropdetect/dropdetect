import { NextRequest, NextResponse } from 'next/server'
import { crawlGitHubRepositories } from '@/src/server/fetchers/githubCrawler'
import { requireAdmin } from '@/src/server/auth'

export const dynamic = 'force-dynamic'

// This endpoint can be triggered manually by admins or via Vercel Cron
export async function GET(req: NextRequest) {
  // Check if request is from Vercel Cron or an admin
  const authHeader = req.headers.get('Authorization')
  const isCronRequest = authHeader === `Bearer ${process.env.CRON_SECRET}`
  
  if (!isCronRequest) {
    // If not a cron request, verify admin access
    try {
      await requireAdmin()
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  try {
    const logs = await crawlGitHubRepositories()
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      logs,
    })
  } catch (error: any) {
    console.error('Error fetching drops:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch drops', 
        message: error.message || String(error),
      },
      { status: 500 }
    )
  }
}