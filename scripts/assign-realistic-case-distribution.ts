import { prisma } from '../src/lib/prisma'

async function assignCasesRealistically() {
  console.log('Starting realistic case assignment...\n')

  // Get all cases and users
  const cases = await prisma.case.findMany({
    select: {
      id: true,
      title: true,
      category: true,
      status: true
    }
  })

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      role: true,
      department: true
    }
  })

  // Define case assignments based on case titles and appropriate departments
  const caseAssignments = [
    {
      title: 'Motorcycle Parts Theft in Vishrambag Area',
      department: 'Patrol Division',
      preferredRoles: ['OFFICER', 'DETECTIVE'],
      assignToSagar: false
    },
    {
      title: 'Assassination of Political Activist Charlie Kirk',
      department: 'Homicide Division',
      preferredRoles: ['DETECTIVE', 'SUPERVISOR'],
      assignToSagar: false
    },
    {
      title: 'Theft of Solar Panels from Agricultural Land in Miraj',
      department: 'Patrol Division',
      preferredRoles: ['OFFICER', 'DETECTIVE'],
      assignToSagar: false
    },
    {
      title: 'Hit-and-Run Incident at Shivaji Mandai Junction',
      department: 'Patrol Division',
      preferredRoles: ['OFFICER'],
      assignToSagar: false
    },
    {
      title: 'Delhi Red Fort Blast',
      department: 'Cyber Crimes Unit',
      preferredRoles: ['DETECTIVE', 'SUPERVISOR'],
      assignToSagar: false
    },
    {
      title: 'test 1',
      department: 'Administration',
      preferredRoles: ['ADMIN'],
      assignToSagar: true  // Keep this with sagar
    },
    {
      title: 'test 22',
      department: 'Homicide Division',
      preferredRoles: ['DETECTIVE'],
      assignToSagar: true  // Keep this with sagar too
    }
  ]

  // Sagar's ID
  const sagarId = '301626c2-0115-449e-a1d7-03c8a57393d2'

  for (const assignment of caseAssignments) {
    const caseToUpdate = cases.find(c => c.title === assignment.title)
    if (!caseToUpdate) {
      console.log(`Case not found: ${assignment.title}`)
      continue
    }

    let assignedOfficerId: string

    if (assignment.assignToSagar) {
      assignedOfficerId = sagarId
      console.log(`Keeping case "${assignment.title}" with sagar`)
    } else {
      // Find appropriate officer from the same department
      const eligibleUsers = users.filter(user => 
        user.department === assignment.department &&
        assignment.preferredRoles.includes(user.role) &&
        user.id !== sagarId // Don't assign to sagar unless specifically requested
      )

      if (eligibleUsers.length === 0) {
        // Fallback to any user in the department
        const fallbackUsers = users.filter(user => 
          user.department === assignment.department &&
          user.id !== sagarId
        )
        
        if (fallbackUsers.length === 0) {
          console.log(`No users found for department: ${assignment.department}, keeping with sagar`)
          assignedOfficerId = sagarId
        } else {
          assignedOfficerId = fallbackUsers[0].id
        }
      } else {
        // Assign to first eligible user
        assignedOfficerId = eligibleUsers[0].id
      }
    }

    // Update the case
    await prisma.case.update({
      where: { id: caseToUpdate.id },
      data: {
        department: assignment.department,
        officerId: assignedOfficerId
      }
    })

    const assignedUser = users.find(u => u.id === assignedOfficerId)
    console.log(`✅ Assigned "${assignment.title}" to ${assignedUser?.name} (${assignedUser?.role}) in ${assignment.department}`)
  }

  console.log('\n=== UPDATED CASE DISTRIBUTION ===')
  
  // Show final distribution
  const updatedCases = await prisma.case.findMany({
    include: {
      User: {
        select: {
          name: true,
          role: true
        }
      }
    }
  })

  updatedCases.forEach(c => {
    console.log(`📋 ${c.title}`)
    console.log(`   Department: ${(c as any).department || 'Unknown'}`)
    console.log(`   Officer: ${c.User.name} (${c.User.role})`)
    console.log(`   Status: ${c.status}\n`)
  })

  // Show cases assigned to sagar
  const sagarCases = updatedCases.filter(c => c.officerId === sagarId)
  console.log('=== CASES ASSIGNED TO SAGAR ===')
  sagarCases.forEach(c => {
    console.log(`- ${c.title} (${(c as any).department || 'Unknown'})`)
  })

  console.log(`\n🎉 Successfully distributed ${cases.length} cases across departments!`)
  console.log(`📊 Sagar has ${sagarCases.length} cases assigned`)

  await prisma.$disconnect()
}

assignCasesRealistically().catch(console.error)