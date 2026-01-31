// 🔌 Prisma client singleton initialization with connection resilience
import { PrismaClient } from '@prisma/client'

declare global {
	var prisma: PrismaClient | undefined
}

const dbUrl = process.env.DATABASE_URL || ''
const url = dbUrl.includes('?')
  ? dbUrl + '&connection_limit=5&pool_timeout=20&connect_timeout=60'
  : dbUrl + '?connection_limit=5&pool_timeout=20&connect_timeout=60'

// Enhanced Prisma client with better connection handling
export const prisma = global.prisma || new PrismaClient({
	log: ['warn', 'error'],
	datasources: {
		db: {
			url
		}
	},
	// Add connection retry logic
	errorFormat: 'pretty',
})

// Graceful connection handling
prisma.$connect().catch((error) => {
	console.error('Failed to connect to database:', error)
})

// Handle connection cleanup
process.on('beforeExit', async () => {
	await prisma.$disconnect()
})

if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma
}
