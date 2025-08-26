import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'; // ✅ fixed import
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 15 minutes in milliseconds
const ONLINE_THRESHOLD = 15 * 60 * 1000;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to view lawyers' },
        { status: 401 }
      );
    }

    // Fetch all lawyers with their profile and online status
    const lawyers = await prisma.user.findMany({
      where: {
        role: 'LAWYER',
        lawyerProfile: {
          isNot: null
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        updatedAt: true, // Using updatedAt as a proxy for lastActive
        lawyerProfile: {
          select: {
            specialization: true,
            bio: true
          }
        },
        _count: {
          select: {
            lawyerCases: true,
            lawyerAppointments: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Add online status based on last updated time
    const now = new Date();
    const lawyersWithStatus = lawyers.map(lawyer => ({
      ...lawyer,
      online: lawyer.updatedAt ? 
        (now.getTime() - lawyer.updatedAt.getTime()) < ONLINE_THRESHOLD : 
        false,
      title: 'Attorney', // Default title since it's not in the schema
      specialization: lawyer.lawyerProfile?.specialization?.[0] || 'General Practice'
    }));

    return NextResponse.json(lawyersWithStatus);
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lawyers' },
      { status: 500 }
    );
  }
}
