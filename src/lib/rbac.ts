import { UserRole } from '@prisma/client'

// Department hierarchy - real-world law enforcement structure  
export const DEPARTMENTS = {
  ADMINISTRATION: 'Administration',
  HOMICIDE: 'Homicide Division', 
  NARCOTICS: 'Narcotics Unit',
  CYBER_CRIMES: 'Cyber Crimes Unit',
  FORENSICS: 'Forensic Laboratory',
  PATROL: 'Patrol Division',
  DETECTIVE_BUREAU: 'Detective Bureau',
  INTERNAL_AFFAIRS: 'Internal Affairs'
} as const

// Permission definitions based on real-world police operations
export type Permission = 
  // User Management
  | 'MANAGE_USERS'
  | 'ASSIGN_ROLES'
  | 'VIEW_ALL_USERS'
  
  // Case Management  
  | 'CREATE_CASE'
  | 'ASSIGN_CASE'
  | 'VIEW_ALL_CASES'
  | 'VIEW_DEPARTMENT_CASES'
  | 'MODIFY_ANY_CASE'
  | 'DELETE_CASE'
  
  // Evidence Management
  | 'UPLOAD_EVIDENCE'
  | 'DOWNLOAD_EVIDENCE'
  | 'DELETE_EVIDENCE'
  | 'VERIFY_EVIDENCE'
  | 'VIEW_ALL_EVIDENCE'
  
  // Administrative
  | 'ACCESS_ADMIN_PANEL'
  | 'VIEW_AUDIT_LOGS'
  | 'MANAGE_DEPARTMENTS'
  | 'EMERGENCY_OVERRIDE'

// Role-based permissions mapping (real-world police hierarchy)
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    // Full administrative access (Chief, IT Director)
    'MANAGE_USERS', 'ASSIGN_ROLES', 'VIEW_ALL_USERS',
    'CREATE_CASE', 'ASSIGN_CASE', 'VIEW_ALL_CASES', 'MODIFY_ANY_CASE', 'DELETE_CASE',
    'UPLOAD_EVIDENCE', 'DOWNLOAD_EVIDENCE', 'DELETE_EVIDENCE', 'VERIFY_EVIDENCE', 'VIEW_ALL_EVIDENCE', 
    'ACCESS_ADMIN_PANEL', 'VIEW_AUDIT_LOGS', 'MANAGE_DEPARTMENTS', 'EMERGENCY_OVERRIDE'
  ],
  
  SUPERVISOR: [
    // Department management (Sergeant, Lieutenant)
    'ASSIGN_CASE', 'VIEW_DEPARTMENT_CASES', 'CREATE_CASE',
    'UPLOAD_EVIDENCE', 'DOWNLOAD_EVIDENCE', 'VERIFY_EVIDENCE',
    'VIEW_AUDIT_LOGS'
  ],
  
  DETECTIVE: [
    // Investigation work (Detective, Senior Officer)
    'CREATE_CASE', 'UPLOAD_EVIDENCE', 'DOWNLOAD_EVIDENCE', 'VERIFY_EVIDENCE'
  ],
  
  OFFICER: [
    // Basic patrol and investigation (Police Officer)
    'CREATE_CASE', 'UPLOAD_EVIDENCE', 'DOWNLOAD_EVIDENCE', 'VERIFY_EVIDENCE'
  ],
  
  FORENSIC_TECH: [
    // Lab analysis only (Crime Lab Technician)
    'VERIFY_EVIDENCE', 'VIEW_ALL_EVIDENCE'
  ],
  
  READONLY: [
    // View-only access (DA, Defense Attorney, Auditor)
    // Permissions granted on case-by-case basis
  ]
}

// Check if user has specific permission
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false
}

// Check if user can access cases from specific department
export function canAccessDepartment(
  userRole: UserRole, 
  userDepartment: string, 
  targetDepartment: string
): boolean {
  switch (userRole) {
    case 'ADMIN':
      return true // Admin can access all departments
      
    case 'SUPERVISOR':
      return userDepartment === targetDepartment // Only own department
      
    case 'DETECTIVE':
    case 'OFFICER':
      return userDepartment === targetDepartment // Only own department
      
    case 'FORENSIC_TECH':
      return true // Can access evidence from all departments for analysis
      
    case 'READONLY':
      return false // No department access by default (case-specific authorization)
      
    default:
      return false
  }
}

// Get case access level for user
export type CaseAccessLevel = 'FULL_ACCESS' | 'READ_ONLY' | 'EVIDENCE_ONLY' | 'NO_ACCESS'

export function getCaseAccessLevel(
  userRole: UserRole,
  userId: string,
  userDepartment: string,
  caseData: {
    officerId: string
    department?: string
  }
): CaseAccessLevel {
  switch (userRole) {
    case 'ADMIN':
      return 'FULL_ACCESS'
      
    case 'SUPERVISOR':
      if (caseData.department === userDepartment) return 'FULL_ACCESS'
      return 'NO_ACCESS'
      
    case 'DETECTIVE':
    case 'OFFICER':
      if (caseData.officerId === userId) return 'FULL_ACCESS'
      if (caseData.department === userDepartment) return 'READ_ONLY' // Can see related department cases
      return 'NO_ACCESS'
      
    case 'FORENSIC_TECH':
      return 'EVIDENCE_ONLY'
      
    case 'READONLY':
      return 'READ_ONLY'
      
    default:
      return 'NO_ACCESS'
  }
}

// Build database access filter based on user role and department
export function buildCaseAccessFilter(userRole: UserRole, userId: string, userDepartment: string) {
  switch (userRole) {
    case 'ADMIN':
      return {} // No filter - access all cases
      
    case 'SUPERVISOR':
      return {
        OR: [
          { department: userDepartment }, // All department cases
          { officerId: userId } // Own cases (if supervisor is also officer)
        ]
      }
      
    case 'DETECTIVE':
    case 'OFFICER':
      return {
        OR: [
          { officerId: userId }, // Own cases
          { department: userDepartment } // Department cases for read access
        ]
      }
      
    case 'FORENSIC_TECH':
      return {} // Can see all cases for evidence analysis context
      
    case 'READONLY':
      return {
        // Readonly users can only see cases explicitly shared (none by default)
        id: 'never-match-readonly'
      }
      
    default:
      return { id: 'never-match' } // No access
  }
}

// Helper to check if user is in role hierarchy above another user
export function isRoleHierarchyAbove(superiorRole: UserRole, subordinateRole: UserRole): boolean {
  const hierarchy = {
    ADMIN: 5,
    SUPERVISOR: 4,
    DETECTIVE: 3,
    OFFICER: 2,
    FORENSIC_TECH: 1,
    READONLY: 0
  }
  
  return hierarchy[superiorRole] > hierarchy[subordinateRole]
}

// Get role display name for UI
export function getRoleDisplayName(role: UserRole): string {
  const roleNames = {
    ADMIN: 'Administrator',
    SUPERVISOR: 'Supervisor', 
    DETECTIVE: 'Detective',
    OFFICER: 'Police Officer',
    FORENSIC_TECH: 'Forensic Technician',
    READONLY: 'Read-Only Access'
  }
  
  return roleNames[role] || role
}

// Get available departments for role assignment
export function getAvailableDepartments(): Array<{value: string, label: string}> {
  return Object.entries(DEPARTMENTS).map(([key, value]) => ({
    value,
    label: value
  }))
}