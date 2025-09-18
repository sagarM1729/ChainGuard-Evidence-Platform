// 🔄 Database connection utilities with retry logic
import { prisma } from './prisma'

interface RetryOptions {
  maxRetries?: number
  delay?: number
  backoff?: boolean
}

/**
 * Execute database operations with automatic retry on connection failures
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = true
  } = options

  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Ensure connection is alive before executing
      await prisma.$queryRaw`SELECT 1`
      
      // Execute the operation
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Check if it's a connection error
      const isConnectionError = 
        error instanceof Error && (
          error.message.includes('Connection') ||
          error.message.includes('ECONNRESET') ||
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('timeout') ||
          error.message.includes('Closed') ||
          error.message.includes('Client has already been released')
        )
      
      if (!isConnectionError || attempt === maxRetries) {
        throw error
      }
      
      // Calculate delay with exponential backoff
      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay
      
      console.warn(`Database connection error (attempt ${attempt}/${maxRetries}):`, error.message)
      console.warn(`Retrying in ${waitTime}ms...`)
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, waitTime))
      
      // Try to reconnect
      try {
        await prisma.$disconnect()
        await prisma.$connect()
      } catch (reconnectError) {
        console.warn('Reconnection attempt failed:', reconnectError)
      }
    }
  }
  
  throw lastError
}

/**
 * Check database connection health
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

/**
 * Gracefully handle database disconnection
 */
export async function gracefulDisconnect(): Promise<void> {
  try {
    await prisma.$disconnect()
    console.log('🔌 Database disconnected gracefully')
  } catch (error) {
    console.error('Error during database disconnection:', error)
  }
}

/**
 * Reconnect to database with retry logic
 */
export async function reconnectDatabase(): Promise<boolean> {
  try {
    await prisma.$disconnect()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await prisma.$connect()
    
    // Verify connection
    await prisma.$queryRaw`SELECT 1`
    console.log('🔌 Database reconnected successfully')
    return true
  } catch (error) {
    console.error('Failed to reconnect to database:', error)
    return false
  }
}

/**
 * Database transaction with retry logic
 */
export async function withTransaction<T>(
  operation: (tx: any) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return withRetry(
    () => prisma.$transaction(operation, {
      timeout: 30000, // 30 seconds timeout
      maxWait: 10000, // 10 seconds max wait for transaction to start
    }),
    options
  )
}