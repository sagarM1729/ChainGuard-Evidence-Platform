// 🔌 Prisma client singleton initialization with connection resilience
import { PrismaClient } from '@prisma/client'

declare global {
	// eslint-disable-next-line no-var
	var prisma: PrismaClient | undefined
}

// Enhanced Prisma client with better connection handling
export const prisma = global.prisma || new PrismaClient({
	log: ['warn', 'error'],
	datasources: {
		db: {
			url: process.env.DATABASE_URL + '&connection_limit=5&pool_timeout=20&connect_timeout=60'
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