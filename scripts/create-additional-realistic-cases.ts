import { prisma } from '../src/lib/prisma'
import { randomUUID } from 'crypto'

async function createAdditionalRealisticCases() {
  console.log('Creating additional realistic cases...\n')

  // Get all users for assignment
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      role: true,
      department: true
    }
  })

  // Additional realistic cases
  const newCases = [
    {
      title: 'Residential Burglary on Model Colony Road',
      description: 'Break-in reported at apartment complex, electronics and jewelry stolen',
      category: 'Burglary',
      department: 'Patrol Division',
      priority: 'HIGH',
      status: 'OPEN',
      location: 'Model Colony, Pune',
      preferredRoles: ['OFFICER', 'DETECTIVE']
    },
    {
      title: 'Drug Trafficking Investigation - Wadgaon Sheri',
      description: 'Anonymous tip about drug distribution network operating from residential area',
      category: 'Drug Crime',
      department: 'Narcotics Unit',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      location: 'Wadgaon Sheri, Pune',
      preferredRoles: ['DETECTIVE', 'SUPERVISOR']
    },
    {
      title: 'Cybercrime - Online Banking Fraud',
      description: 'Multiple victims reported unauthorized transactions from their accounts',
      category: 'Cyber Crime',
      department: 'Cyber Crimes Unit',
      priority: 'MEDIUM',
      status: 'UNDER_REVIEW',
      location: 'Online',
      preferredRoles: ['DETECTIVE']
    },
    {
      title: 'Domestic Violence Case - Kothrud',
      description: 'Reported case of domestic abuse, victim seeking protection',
      category: 'Domestic Violence',
      department: 'Patrol Division',
      priority: 'HIGH',
      status: 'OPEN',
      location: 'Kothrud, Pune',
      preferredRoles: ['OFFICER']
    },
    {
      title: 'Murder Investigation - Deccan Area',
      description: 'Body found in abandoned building, investigation ongoing',
      category: 'Murder',
      department: 'Homicide Division',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      location: 'Deccan, Pune',
      preferredRoles: ['DETECTIVE', 'SUPERVISOR']
    },
    {
      title: 'Evidence Analysis - DNA Testing',
      description: 'Forensic analysis required for samples from multiple cases',
      category: 'Forensic Analysis',
      department: 'Forensic Laboratory',
      priority: 'MEDIUM',
      status: 'OPEN',
      location: 'Lab',
      preferredRoles: ['FORENSIC_TECH']
    },
    {
      title: 'Vehicle Theft - Baner Area',
      description: 'High-end motorcycle reported stolen from parking garage',
      category: 'Vehicle Theft',
      department: 'Patrol Division',
      priority: 'MEDIUM',
      status: 'OPEN',
      location: 'Baner, Pune',
      preferredRoles: ['OFFICER']
    },
    {
      title: 'Corruption Investigation - Municipal Office',
      description: 'Allegations of bribery and misconduct in permit approvals',
      category: 'Corruption',
      department: 'Internal Affairs',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      location: 'Municipal Office',
      preferredRoles: ['READONLY'] // Internal Affairs investigator
    },
    {
      title: 'Human Trafficking Network Investigation',
      description: 'Cross-border trafficking operation suspected, coordination with other agencies',
      category: 'Human Trafficking',
      department: 'Cyber Crimes Unit',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      location: 'Multi-location',
      preferredRoles: ['DETECTIVE', 'SUPERVISOR']
    },
    {
      title: 'Sagar Test Case - Administrative Review',
      description: 'Special administrative case for testing department workflows',
      category: 'Administrative',
      department: 'Administration',
      priority: 'LOW',
      status: 'OPEN',
      location: 'Police Station',
      assignToSagar: true
    }
  ]

  const sagarId = '301626c2-0115-449e-a1d7-03c8a57393d2'

  for (const caseData of newCases) {
    let assignedOfficerId: string

    if (caseData.assignToSagar) {
      assignedOfficerId = sagarId
    } else {
      // Find appropriate officer
      const eligibleUsers = users.filter(user => 
        user.department === caseData.department &&
        caseData.preferredRoles?.includes(user.role) &&
        user.id !== sagarId
      )

      if (eligibleUsers.length === 0) {
        // Fallback to any user in the department
        const fallbackUsers = users.filter(user => 
          user.department === caseData.department
        )
        
        if (fallbackUsers.length === 0) {
          // Final fallback to sagar
          assignedOfficerId = sagarId
        } else {
          assignedOfficerId = fallbackUsers[Math.floor(Math.random() * fallbackUsers.length)].id
        }
      } else {
        // Randomly assign to one of the eligible users for variety
        assignedOfficerId = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)].id
      }
    }

    // Generate case number
    const caseNumber = `CASE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    // Create the case
    await prisma.case.create({
      data: {
        id: randomUUID(),
        caseNumber,
        title: caseData.title,
        description: caseData.description,
        category: caseData.category,
        department: caseData.department,
        priority: caseData.priority as any,
        status: caseData.status as any,
        location: caseData.location,
        officerId: assignedOfficerId
      }
    })

    const assignedUser = users.find(u => u.id === assignedOfficerId)
    console.log(`✅ Created "${caseData.title}"`)
    console.log(`   Assigned to: ${assignedUser?.name} (${assignedUser?.role})`)
    console.log(`   Department: ${caseData.department} | Priority: ${caseData.priority}`)
    console.log(`   Status: ${caseData.status}\n`)
  }

  // Show final statistics
  console.log('=== FINAL CASE STATISTICS ===')
  const allCases = await prisma.case.findMany({
    include: {
      User: {
        select: {
          name: true,
          role: true,
          department: true
        }
      }
    }
  })

  // Group by department
  const casesByDepartment = allCases.reduce((acc, case_) => {
    const dept = (case_ as any).department || 'Unknown'
    if (!acc[dept]) {
      acc[dept] = []
    }
    acc[dept].push(case_)
    return acc
  }, {} as Record<string, any[]>)

  Object.entries(casesByDepartment).forEach(([dept, cases]) => {
    console.log(`\n🏢 ${dept}: ${cases.length} cases`)
    cases.forEach(c => {
      console.log(`   - ${c.title} (${c.User.name} - ${c.status})`)
    })
  })

  // Sagar's cases
  const sagarCases = allCases.filter(c => c.officerId === sagarId)
  console.log(`\n👤 Sagar's Cases: ${sagarCases.length} total`)
  sagarCases.forEach(c => {
    console.log(`   - ${c.title} (${(c as any).department || 'Unknown'})`)
  })

  console.log(`\n🎉 Successfully created ${newCases.length} additional cases!`)
  console.log(`📊 Total cases in system: ${allCases.length}`)

  await prisma.$disconnect()
}

createAdditionalRealisticCases().catch(console.error)