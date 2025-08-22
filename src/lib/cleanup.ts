// 🧹 Token cleanup utilities
import { prisma } from './prisma'

/**
 * Clean up all expired password reset tokens
 * @returns Object with count of deleted tokens
 */
export async function cleanupAllExpiredTokens() {
  try {
    const result = await (prisma as any).passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date() // Delete all tokens that have expired
        }
      }
    })

    console.log(`🧹 Cleaned up ${result.count} expired tokens globally`)
    return { deletedCount: result.count, success: true }
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error)
    return { deletedCount: 0, success: false, error }
  }
}

/**
 * Get count of expired tokens without deleting them
 * @returns Object with count of expired tokens
 */
export async function getExpiredTokensCount() {
  try {
    const count = await (prisma as any).passwordResetToken.count({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    return { count, success: true }
  } catch (error) {
    console.error('Error counting expired tokens:', error)
    return { count: 0, success: false, error }
  }
}

/**
 * Get total count of all tokens
 * @returns Object with total token count
 */
export async function getTotalTokensCount() {
  try {
    const count = await (prisma as any).passwordResetToken.count()
    return { count, success: true }
  } catch (error) {
    console.error('Error counting total tokens:', error)
    return { count: 0, success: false, error }
  }
}
