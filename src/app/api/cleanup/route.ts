// 🧹 Manual token cleanup API endpoint
import { NextRequest, NextResponse } from 'next/server'
import { cleanupAllExpiredTokens, getExpiredTokensCount, getTotalTokensCount } from '@/lib/cleanup'

export async function GET(request: NextRequest) {
  try {
    const [expiredResult, totalResult] = await Promise.all([
      getExpiredTokensCount(),
      getTotalTokensCount()
    ])
    
    return NextResponse.json({
      success: true,
      expiredTokens: expiredResult.count,
      totalTokens: totalResult.count,
      activeTokens: totalResult.count - expiredResult.count
    })
  } catch (error) {
    console.error('Error getting token stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get token statistics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get count before cleanup
    const beforeCleanup = await getExpiredTokensCount()
    
    // Perform cleanup
    const result = await cleanupAllExpiredTokens()
    
    // Get count after cleanup
    const afterCleanup = await getTotalTokensCount()
    
    return NextResponse.json({
      success: true,
      deletedTokens: result.deletedCount,
      remainingTokens: afterCleanup.count,
      message: `Successfully cleaned up ${result.deletedCount} expired tokens`
    })
  } catch (error) {
    console.error('Error during manual cleanup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup expired tokens' },
      { status: 500 }
    )
  }
}
