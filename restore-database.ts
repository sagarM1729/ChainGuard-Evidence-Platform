import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function restoreDatabaseData(exportFilePath: string) {
  try {
    console.log('🔄 Starting database restore...\n')

    // Check if export file exists
    if (!fs.existsSync(exportFilePath)) {
      throw new Error(`Export file not found: ${exportFilePath}`)
    }

    // Read export data
    const exportData = JSON.parse(fs.readFileSync(exportFilePath, 'utf8'))
    
    console.log(`📄 Restoring from: ${exportFilePath}`)
    console.log(`📅 Export date: ${exportData.exportDate}`)
    
    // Clear existing data (in reverse order to handle foreign keys)
    console.log('\n🧹 Clearing existing data...')
    await prisma.password_reset_tokens.deleteMany()
    await prisma.evidence.deleteMany()
    await prisma.case.deleteMany()
    await prisma.user.deleteMany()
    await prisma.whitelist.deleteMany()
    
    // Restore data (in correct order to handle foreign keys)
    console.log('\n📥 Restoring data...')
    
    // Restore whitelist first
    if (exportData.tables.whitelist.length > 0) {
      await prisma.whitelist.createMany({
        data: exportData.tables.whitelist
      })
      console.log(`✅ Restored ${exportData.tables.whitelist.length} whitelist entries`)
    }
    
    // Restore users
    if (exportData.tables.users.length > 0) {
      // Note: Users need to reset passwords as we don't export password hashes
      await prisma.user.createMany({
        data: exportData.tables.users.map((user: any) => ({
          ...user,
          password: 'RESTORE_REQUIRED' // Users will need to reset passwords
        }))
      })
      console.log(`✅ Restored ${exportData.tables.users.length} users`)
      console.log('⚠️  Users will need to reset their passwords')
    }
    
    // Restore cases
    if (exportData.tables.cases.length > 0) {
      for (const caseData of exportData.tables.cases) {
        // Extract evidence and user data
        const { evidence, User, ...caseOnly } = caseData
        
        await prisma.case.create({
          data: caseOnly
        })
      }
      console.log(`✅ Restored ${exportData.tables.cases.length} cases`)
    }
    
    // Restore evidence
    if (exportData.tables.evidence.length > 0) {
      for (const evidenceData of exportData.tables.evidence) {
        // Extract case data
        const { case: caseData, ...evidenceOnly } = evidenceData
        
        await prisma.evidence.create({
          data: evidenceOnly
        })
      }
      console.log(`✅ Restored ${exportData.tables.evidence.length} evidence items`)
    }
    
    // Restore password reset tokens
    if (exportData.tables.passwordResetTokens.length > 0) {
      await prisma.password_reset_tokens.createMany({
        data: exportData.tables.passwordResetTokens
      })
      console.log(`✅ Restored ${exportData.tables.passwordResetTokens.length} password reset tokens`)
    }
    
    console.log('\n✅ Database restore completed successfully!')
    console.log('🔄 Regenerating Prisma client...')
    
  } catch (error) {
    console.error('❌ Error during restore:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Get export file from command line arguments
const exportFile = process.argv[2]
if (!exportFile) {
  console.error('❌ Please provide the export file path as an argument')
  console.log('Usage: npx tsx restore-database.ts <export-file-path>')
  process.exit(1)
}

restoreDatabaseData(exportFile).catch(console.error)