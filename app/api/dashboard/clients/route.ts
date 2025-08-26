import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'; // ✅ fixed import
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, CaseStatus, User, Case, ClientProfile } from '@prisma/client';

// Extend the User type to include the relations we're using
type UserWithRelations = User & {
  clientProfile: ClientProfile | null;
  clientCases: Array<{
    id: string;
    status: CaseStatus;
    messages: Array<{
      id: string;
      createdAt: Date;
    }>;
    updatedAt: Date;
  }>;
};

export async function GET() {
  try {
    // Verify user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get clients assigned to this lawyer with their cases
    const clients = await prisma.user.findMany({
      where: {
        role: 'CLIENT',
        clientProfile: {
          assignedLawyerId: session.user.id
        }
      },
      include: {
        clientProfile: true,
        clientCases: {
          where: { lawyerId: session.user.id },
          select: {
            id: true,
            status: true,
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { 
                id: true,
                createdAt: true 
              }
            },
            updatedAt: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Format the response
    const formattedClients = clients.map(client => {
      const clientCases = client.clientCases || [];
      const activeCases = clientCases.filter(c => c.status === 'IN_PROGRESS' || c.status === 'OPEN').length;
      const pendingCases = clientCases.filter(c => c.status === 'ON_HOLD').length;
      const completedCases = clientCases.filter(c => c.status === 'CLOSED').length;
      
      // Get last contact from the most recent case update or message
      const lastContact = clientCases.length > 0 
        ? new Date(Math.max(
            ...clientCases.map(c => 
              Math.max(
                new Date(c.updatedAt).getTime(),
                c.messages[0]?.createdAt ? new Date(c.messages[0].createdAt).getTime() : 0
              )
            )
          )).toISOString()
        : null;
      
      return {
        id: client.id,
        name: client.name || 'Unknown Client',
        email: client.email || 'No email',
        phone: client.clientProfile?.phone || 'No phone',
        image: client.image || undefined,
        status: activeCases > 0 ? 'Active' : pendingCases > 0 ? 'Pending' : 'Inactive',
        cases: clientCases.length,
        activeCases,
        pendingCases,
        completedCases,
        joinDate: client.createdAt.toISOString(),
        lastContact,
        lastCaseStatus: clientCases[0]?.status || 'No cases',
        lawyerNotes: '' // Notes field doesn't exist in ClientProfile model
      };
    });

    console.log(`Returning ${formattedClients.length} clients`);
    return new NextResponse(JSON.stringify(formattedClients), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in GET /api/dashboard/clients:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
