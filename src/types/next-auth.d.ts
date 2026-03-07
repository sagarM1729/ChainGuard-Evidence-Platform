import NextAuth from "next-auth"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: UserRole
      department: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    role: UserRole
    department: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: UserRole
    department?: string
  }
}
