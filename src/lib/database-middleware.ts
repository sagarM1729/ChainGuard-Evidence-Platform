// 🔌 Database health monitoring middleware
import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseHealth, reconnectDatabase } from '@/lib/db-utils'

let lastHealthCheck = 0
let isHealthy = true
const HEALTH_CHECK_INTERVAL = 30000 // 30 seconds

/**
 * Middleware to check database health and handle connection issues
 */
export async function databaseHealthMiddleware(
  request: NextRequest,
  next: () => Promise<NextResponse>
): Promise<NextResponse> {
  const now = Date.now()
  
  // Only check health periodically to avoid overloading
  if (now - lastHealthCheck > HEALTH_CHECK_INTERVAL || !isHealthy) {
    lastHealthCheck = now
    
    try {
      isHealthy = await checkDatabaseHealth()
      
      if (!isHealthy) {
        console.warn('🚨 Database health check failed, attempting reconnection...')
        isHealthy = await reconnectDatabase()
        
        if (!isHealthy) {
          console.error('❌ Database reconnection failed')
          return NextResponse.json(
            { 
              error: 'Database connection error. Please try again in a moment.',
              code: 'DB_CONNECTION_ERROR'
            },
            { status: 503 }
          )
        } else {
          console.log('✅ Database reconnection successful')
        }
      }
    } catch (error) {
      console.error('Database health check error:', error)
      isHealthy = false
      
      return NextResponse.json(
        { 
          error: 'Database service temporarily unavailable',
          code: 'DB_SERVICE_UNAVAILABLE'
        },
        { status: 503 }
      )
    }
  }
  
  // If database is healthy or we're not checking this request, proceed
  try {
    return await next()
  } catch (error) {
    // If request fails with DB error, mark as unhealthy
    if (error instanceof Error && 
        (error.message.includes('Connection') || 
         error.message.includes('Closed') ||
         error.message.includes('timeout'))) {
      isHealthy = false
      lastHealthCheck = 0 // Force health check on next request
    }
    throw error
  }
}

/**
 * Simple wrapper function for API routes to use the middleware
 */
export function withDatabaseHealth(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    return databaseHealthMiddleware(request, () => handler(request))
  }
}