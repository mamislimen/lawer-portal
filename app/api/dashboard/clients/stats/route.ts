import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Verify session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get lawyer's cases to determine client statuses
    const cases = await prisma.case.findMany({
      where: {
        lawyerId: session.user.id
      },
      select: {
        clientId: true,
        status: true
      }
    });

    // Group cases by client
    const clientStatuses = new Map<string, Set<string>>();
    
    cases.forEach(c => {
      if (!clientStatuses.has(c.clientId)) {
        clientStatuses.set(c.clientId, new Set());
      }
      clientStatuses.get(c.clientId)?.add(c.status);
    });

    // Calculate stats
    let totalClients = clientStatuses.size;
    let activeClients = 0;
    let newClients = 0;
    let pendingClients = 0;
    let closedCases = 0;

    // Count cases by status
    cases.forEach(c => {
      if (c.status === 'IN_PROGRESS') activeClients = 1; // Only need to set once per client
      else if (c.status === 'ON_HOLD') pendingClients++;
      else if (c.status === 'CLOSED') closedCases++;
      else if (c.status === 'OPEN') newClients++;
    });

    // Count clients with no cases as new
    const clientsWithNoCases = await prisma.user.count({
      where: {
        role: 'CLIENT',
        id: { notIn: Array.from(clientStatuses.keys()) }
      }
    });
    
    newClients += clientsWithNoCases;
    totalClients += clientsWithNoCases;

    return NextResponse.json({
      total: totalClients,
      active: activeClients,
      pending: pendingClients,
      new: newClients,
      closed: closedCases
    });

  } catch (error) {
    console.error('Error in clients stats API:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to load client statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
