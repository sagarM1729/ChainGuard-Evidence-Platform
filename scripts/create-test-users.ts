import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

// Test users for all roles with real-world police structure
const testUsers = [
  // Admin - Police Chief
  {
    email: 'chief@police.gov',
    name: 'Chief Robert Johnson',
    role: 'ADMIN' as UserRole,
    department: 'Administration',
    badge: 'CHIEF-001'
  },
  
  // Supervisor - Homicide Sergeant  
  {
    email: 'sgt.martinez@police.gov',
    name: 'Sergeant Maria Martinez',
    role: 'SUPERVISOR' as UserRole,
    department: 'Homicide Division', 
    badge: 'SGT-H001'
  },
  
  // Supervisor - Narcotics Lieutenant
  {
    email: 'lt.garcia@police.gov',
    name: 'Lieutenant Carmen Garcia', 
    role: 'SUPERVISOR' as UserRole,
    department: 'Narcotics Unit',
    badge: 'LT-N001'
  },
  
  // Detective - Homicide Detective
  {
    email: 'det.wilson@police.gov', 
    name: 'Detective James Wilson',
    role: 'DETECTIVE' as UserRole,
    department: 'Homicide Division',
    badge: 'DET-H005'
  },
  
  // Detective - Cyber Crimes
  {
    email: 'det.kim@police.gov',
    name: 'Detective Lisa Kim',
    role: 'DETECTIVE' as UserRole,
    department: 'Cyber Crimes Unit', 
    badge: 'DET-C003'
  },
  
  // Officer - Patrol Officer
  {
    email: 'ofc.thompson@police.gov',
    name: 'Officer David Thompson',
    role: 'OFFICER' as UserRole, 
    department: 'Patrol Division',
    badge: 'OFC-P112'
  },
  
  // Officer - Narcotics Officer
  {
    email: 'ofc.rodriguez@police.gov',
    name: 'Officer Ana Rodriguez',
    role: 'OFFICER' as UserRole,
    department: 'Narcotics Unit',
    badge: 'OFC-N045'
  },
  
  // Forensic Tech
  {
    email: 'tech.chen@police.gov',
    name: 'Sarah Chen',
    role: 'FORENSIC_TECH' as UserRole,
    department: 'Forensic Laboratory', 
    badge: 'TECH-001'
  },
  
  // Forensic Tech - Digital Specialist
  {
    email: 'tech.brown@police.gov',
    name: 'Michael Brown',
    role: 'FORENSIC_TECH' as UserRole,
    department: 'Forensic Laboratory',
    badge: 'TECH-002'
  },
  
  // Read-Only - District Attorney
  {
    email: 'da.office@state.gov',
    name: 'District Attorney Office',
    role: 'READONLY' as UserRole,
    department: 'Legal Affairs',
    badge: 'DA-001'
  },
  
  // Read-Only - Internal Affairs
  {
    email: 'ia.investigator@police.gov',
    name: 'Internal Affairs Investigator',
    role: 'READONLY' as UserRole,
    department: 'Internal Affairs',
    badge: 'IA-001'
  }
]

async function createTestUsers() {
  console.log('🚀 Creating test users for RBAC system...')
  console.log('📋 Password for all users: "chainguard"')
  console.log('')
  
  // Hash the password once for all users
  const hashedPassword = await bcrypt.hash('chainguard', 12)
  
  for (const user of testUsers) {
    try {
      await prisma.user.create({
        data: {
          id: randomUUID(),
          email: user.email,  
          name: user.name,
          password: hashedPassword,
          role: user.role,
          department: user.department,
          badge: user.badge,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      console.log(`✅ Created ${user.role.padEnd(12)} | ${user.name.padEnd(25)} | ${user.email}`)
      
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        console.log(`⚠️  Already exists: ${user.email}`)
      } else {
        console.error(`❌ Error creating user ${user.email}:`, error)
      }
    }
  }
  
  await prisma.$disconnect()
  
  console.log('')
  console.log('🎉 Test user creation complete!')
  console.log('')
  console.log('👥 Created Users by Role:')
  console.log('=========================')
  
  // Group users by role
  const usersByRole = testUsers.reduce((acc, user) => {
    if (!acc[user.role]) acc[user.role] = []
    acc[user.role].push(user)
    return acc
  }, {} as Record<UserRole, typeof testUsers>)
  
  Object.entries(usersByRole).forEach(([role, users]) => {
    console.log(`\n${role}:`)
    users.forEach(user => {
      console.log(`  • ${user.name} (${user.email})`)
      console.log(`    Department: ${user.department}`)
      console.log(`    Badge: ${user.badge}`)
    })
  })
  
  console.log('')
  console.log('🔐 Login Instructions:')
  console.log('=====================')
  console.log('Email: Any email from above')
  console.log('Password: chainguard')
  console.log('')
  console.log('🏢 Department Structure:')
  console.log('========================')
  console.log('• Administration (Chief)')
  console.log('• Homicide Division (Supervisor + Detective)')
  console.log('• Narcotics Unit (Supervisor + Officer)')
  console.log('• Cyber Crimes Unit (Detective)')
  console.log('• Patrol Division (Officer)')
  console.log('• Forensic Laboratory (2x Forensic Techs)')
  console.log('• Legal Affairs & Internal Affairs (Read-only access)')
}

createTestUsers().catch(console.error)