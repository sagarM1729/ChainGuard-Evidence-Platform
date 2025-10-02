import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function exportDatabaseData() {
  try {
    console.log('🔄 Starting database export...\n')

    // Create backup directory
    const backupDir = './database-backups'
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const exportFile = path.join(backupDir, `chainguard_data_export_${timestamp}.json`)

    // Export all data
    const exportData = {
      exportDate: new Date().toISOString(),
      tables: {
        cases: await prisma.case.findMany({
          include: {
            evidence: true,
            User: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                badge: true,
                department: true
              }
            }
          }
        }),
        evidence: await prisma.evidence.findMany({
          include: {
            case: {
              select: {
                id: true,
                caseNumber: true,
                title: true
              }
            }
          }
        }),
        users: await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
            badge: true,
            department: true,
            role: true,
            // Note: password is excluded for security
          }
        }),
        activities: await prisma.activity.findMany({
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        }),
        whitelist: await prisma.whitelist.findMany(),
        passwordResetTokens: await prisma.password_reset_tokens.findMany()
      }
    }

    // Write to file
    fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2))

    // Generate summary
    console.log('✅ Database export completed successfully!')
    console.log(`📄 Export file: ${exportFile}`)
    console.log(`📊 File size: ${(fs.statSync(exportFile).size / 1024).toFixed(2)} KB`)
    console.log('\n📋 Data exported:')
    console.log(`   📁 Cases: ${exportData.tables.cases.length}`)
    console.log(`   📄 Evidence: ${exportData.tables.evidence.length}`)
    console.log(`   👤 Users: ${exportData.tables.users.length}`)
    console.log(`   📊 Activities: ${exportData.tables.activities.length}`)
    console.log(`   ✅ Whitelist: ${exportData.tables.whitelist.length}`)
    console.log(`   🔑 Reset Tokens: ${exportData.tables.passwordResetTokens.length}`)

    // Show case details
    if (exportData.tables.cases.length > 0) {
      console.log('\n📁 Cases backed up:')
      exportData.tables.cases.forEach(c => {
        console.log(`   • ${c.caseNumber}: ${c.title}`)
        console.log(`     - Status: ${c.status}, Priority: ${c.priority}`)
        console.log(`     - Evidence items: ${c.evidence.length}`)
        console.log(`     - Officer: ${c.User.email}`)
      })
    }

    console.log('\n💡 This export contains all your current data.')
    console.log('   You can safely proceed with database modifications now.')
    
    return exportFile

  } catch (error) {
    console.error('❌ Error during export:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

exportDatabaseData().catch(console.error)