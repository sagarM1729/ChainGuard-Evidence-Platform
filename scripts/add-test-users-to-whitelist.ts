import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

// Email addresses for all the test users
const testUserEmails = [
  'chief@police.gov',
  'sgt.martinez@police.gov', 
  'lt.garcia@police.gov',
  'det.wilson@police.gov',
  'det.kim@police.gov',
  'ofc.thompson@police.gov',
  'ofc.rodriguez@police.gov',
  'tech.chen@police.gov',
  'tech.brown@police.gov',
  'da.office@state.gov',
  'ia.investigator@police.gov'
]

async function addToWhitelist() {
  console.log('📋 Adding test users to whitelist...')
  console.log('')
  
  for (const email of testUserEmails) {
    try {
      await prisma.whitelist.create({
        data: {
          id: randomUUID(),
          email: email
        }
      })
      
      console.log(`✅ Added to whitelist: ${email}`)
      
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        console.log(`⚠️  Already whitelisted: ${email}`)
      } else {
        console.error(`❌ Error adding ${email}:`, error)
      }
    }
  }
  
  await prisma.$disconnect()
  console.log('')
  console.log('🎉 Whitelist update complete!')
  console.log('Now you can run the user creation script.')
}

addToWhitelist().catch(console.error)