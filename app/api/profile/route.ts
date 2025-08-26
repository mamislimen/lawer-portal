import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs"; // if not installed: npm install bcryptjs

// Create a new client
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone, lawyerId } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if email already exists in the User model
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // First create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'CLIENT',
      },
    });

    // Then create the client profile
    const clientProfile = await prisma.clientProfile.create({
      data: {
        userId: user.id,
        phone,
        assignedLawyerId: lawyerId || null,
      },
      include: {
        assignedLawyer: true,
      },
    });

    // Combine user and client profile data for the response
    const responseData = {
      ...user,
      clientProfile
    };
    
    // Remove sensitive data before sending response
    const { password: _, ...userWithoutPassword } = responseData;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client", details: error.message },
      { status: 500 }
    );
  }
}

// Fetch all users with client profiles (for lawyer dashboard)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'CLIENT',
      },
      include: {
        clientProfile: {
          include: {
            assignedLawyer: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // newest first
      },
    });

    // Remove sensitive data before sending response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    return NextResponse.json(usersWithoutPasswords, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}
