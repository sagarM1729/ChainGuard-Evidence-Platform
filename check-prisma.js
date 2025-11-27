
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

console.log('Activity model exists:', !!prisma.activity)
console.log('Keys on prisma:', Object.keys(prisma))
