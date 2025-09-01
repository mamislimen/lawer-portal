import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions, User, Account, Profile } from "next-auth"
import { JWT } from "next-auth/jwt"
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

type UserRole = 'CLIENT' | 'LAWYER' | 'ADMIN'

declare module 'next-auth' {
  interface Session {
    user: {
      lawyerId: any
      id: string
      name?: string | null
      email: string
      image?: string | null
      role: UserRole
    },
    callbackUrl?: string
  }

  interface User {
    id: string
    name?: string | null
    email: string
    image?: string | null
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    email?: string
    name?: string | null
    picture?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      profile(profile: GoogleProfile) {
        // Ensure required fields are present and properly typed
        if (!profile.sub || !profile.email) {
          throw new Error('Google profile is missing required fields')
        }
        
        return {
          id: profile.sub,
          name: profile.name || '',
          email: profile.email,
          image: profile.picture || null,
          role: 'CLIENT' as UserRole
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user?.password) {
          throw new Error('Invalid credentials')
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials')
        }

        return user
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }: { user: any, account: any, profile?: any }) {
      try {
        // Handle Google OAuth sign-in
        if (account?.provider === 'google' && user.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          // If user doesn't exist, create a new user with client role
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || '',
                image: user.image || null,
                role: 'CLIENT',
                emailVerified: new Date(),
              },
            });
          } else if (existingUser.image !== user.image || existingUser.name !== user.name) {
            // Update existing user's profile if needed
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name,
                image: user.image,
              },
            });
          }
        }
        // Get the full user data with role
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true }
        });

        // Store the intended URL in the token for the redirect callback
        if (account) {
          // This will be available in the JWT callback
          (account as any).userRole = dbUser?.role;
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    
    async session({ session, token }) {
      if (session.user) {
        // Ensure all required fields are set with proper types
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) || 'CLIENT';
        session.user.email = token.email as string || '';
        session.user.name = token.name as string || null;
        session.user.image = token.picture as string || null;
        
        // Set the callback URL based on user role
        const role = session.user.role;
        session.callbackUrl = (role === 'LAWYER' || role === 'ADMIN') ? '/dashboard' : '/client';
      }
      return session;
    },
    
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (account && user) {
        // Fetch the latest user data from the database to ensure we have the correct role
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { 
            role: true,
            email: true,
            name: true,
            image: true
          }
        });
        
        if (!dbUser) {
          return token;
        }
        
        // Determine the role and set appropriate callback URL
        const role = dbUser.role || 'CLIENT';
        const callbackUrl = role === 'LAWYER' || role === 'ADMIN' ? '/dashboard' : '/client';
        
        return {
          ...token,
          id: user.id,
          role: role,
          email: dbUser.email,
          name: dbUser.name,
          picture: dbUser.image,
          callbackUrl: callbackUrl
        };
      }
      
      // On subsequent requests, update the token with the latest user data
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true }
        });
        
        if (dbUser) {
          token.role = dbUser.role;
          // Update callback URL if role changes
          token.callbackUrl = dbUser.role === 'CLIENT' ? '/client' : '/dashboard';
        }
      }
      
      return token;
    },
    
    async redirect({ url, baseUrl }: { url: string, baseUrl: string }) {
      // Allow redirects to continue if they're already set
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      
      // After sign in, redirect to dashboard if coming from sign-in
      // The actual role-based redirect is handled in the sign-in callback
      
      // Default to client dashboard
      return `${baseUrl}/client`;
    }
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}
