// types/next-auth.d.ts
import NextAuth from "next-auth"
import { Session } from "next-auth"
import { UserRole } from "@/lib/types" // or wherever your UserRole type is defined

declare module "next-auth" {
  interface Session extends defaultSession {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      image?: string | null

    }
  }
  interface User {
    id: string
    email: string
    name?: string | null
    role: UserRole
    image?: string | null
}
}
