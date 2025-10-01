import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Seeding whitelist emails...')

  const emails = [
    'test@example.com',
    'admin@chainguard.com',
    'officer@police.gov',
    'detective@law.enforcement',
    'forensic@lab.gov'
  ]

  for (const email of emails) {
    try {
      await prisma.whitelist.upsert({
        where: { email },
        update: {},
        create: {
          id: randomUUID(),
          email
        }
      })
      console.log(`✅ Added: ${email}`)
    } catch (error) {
      console.error(`❌ Failed to add ${email}:`, error)
    }
  }

  console.log('✅ Whitelist seeding completed!')

  // Display all whitelisted emails
  const allEmails = await prisma.whitelist.findMany()
  console.log('\n📋 Current Whitelist:')
  allEmails.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.email}`)
  })
}

main()
  .catch((error) => {
    console.error('❌ Error seeding whitelist:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
