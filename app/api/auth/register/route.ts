import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Special admin credentials
const ADMIN_EMAIL = "topadmin@example.com"
const ADMIN_PASSWORD = "topadmin"

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )
    }

    // Check if user is trying to register as admin
    if (email.toLowerCase() === ADMIN_EMAIL) {
      // Check if password matches admin password
      const passwordMatch = await bcrypt.compare(password, ADMIN_PASSWORD)
      if (!passwordMatch) {
        return NextResponse.json(
          { message: "Invalid admin credentials" },
          { status: 401 }
        )
      }

      // Ensure admin user exists
      const adminUser = await ensureAdminUser()

      // Don't return the password hash
      const { password: _, ...adminUserWithoutPassword } = adminUser

      return NextResponse.json(
        { user: adminUserWithoutPassword, message: "Admin login successful" },
        { status: 200 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with CLIENT role by default
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'CLIENT',
        emailVerified: new Date(),
      },
    })

    try {
      // Find an available lawyer to assign (if any exist)
      const availableLawyer = await prisma.user.findFirst({
        where: {
          role: 'LAWYER',
          lawyerProfile: {
            isNot: null
          }
        },
        orderBy: {
          // Assign to the lawyer with the fewest assigned clients
          assignedClients: {
            _count: 'asc'
          }
        },
        select: {
          id: true
        }
      });

      // Create client profile with optional lawyer assignment
      await prisma.clientProfile.create({
        data: {
          userId: user.id,
          phone: '', // Will be updated by the user
          address: '', // Will be updated by the user
          ...(availableLawyer && { assignedLawyerId: availableLawyer.id })
        },
      });
    } catch (error) {
      console.error('Error creating client profile:', error);
      // If client profile creation fails, delete the user to maintain data consistency
      await prisma.user.delete({
        where: { id: user.id }
      });
      throw new Error('Failed to create client profile');
    }

    // Don't return the password hash
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { user: userWithoutPassword, message: "Client account created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

// Function to create or update the admin user
export async function ensureAdminUser() {
  try {
    // Check if admin user exists
    let adminUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    })

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)

    if (!adminUser) {
      // Create admin user if it doesn't exist
      adminUser = await prisma.user.upsert({
        where: { email: ADMIN_EMAIL },
        update: {},
        create: {
          name: "Top Admin",
          email: ADMIN_EMAIL,
          password: hashedPassword,
          role: 'LAWYER',
          emailVerified: new Date(),
        },
      })

      // Create lawyer profile for admin with only the fields that exist in the schema
      await prisma.lawyerProfile.upsert({
        where: { userId: adminUser.id },
        update: {},
        create: {
          userId: adminUser.id,
          specialization: ['Administration'],
          bio: 'System Administrator',
          barNumber: 'ADMIN-001',
          experience: 10,  // Default experience in years
        },
      })
    } else {
      // Update password if it's different
      const passwordMatch = await bcrypt.compare(ADMIN_PASSWORD, adminUser.password || '')
      if (!passwordMatch) {
        await prisma.user.update({
          where: { id: adminUser.id },
          data: { password: hashedPassword },
        })
      }
    }

    return adminUser
  } catch (error) {
    console.error("Error ensuring admin user:", error)
    throw error
  }
}
