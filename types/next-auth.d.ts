// types/next-auth.d.ts
import NextAuth from "next-auth"
import { Session } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'LAWYER' | 'CLIENT' | 'ADMIN'
      image?: string | null
    }
    accessToken?: string
  }
  
  interface User {
    id: string
    email: string
    name?: string | null
    role: 'LAWYER' | 'CLIENT' | 'ADMIN'
    image?: string | null
  }
}
