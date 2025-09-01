import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get all client users
    const clientUsers = await prisma.user.findMany({
      where: {
        role: 'CLIENT'
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Return basic client info with empty cases array
    const formattedClients = clientUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email || '',
      cases: [] // We'll handle cases separately if needed
    }));

    return NextResponse.json(formattedClients);
    
  } catch (error) {
    console.error('Error fetching clients with cases:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
