import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Case, CaseStatus, Priority } from '@prisma/client';

type CaseWithRelations = Case & {
  client: {
    id: string;
    name: string | null;
  };
  documents: Array<{
    createdAt: Date;
  }>;
  messages: Array<{
    createdAt: Date;
  }>;
  value: number | null;
  dueDate: Date | null;
  description: string | null;
  status: string;
  priority: string;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the current user's cases
    const cases = await prisma.case.findMany({
      where: {
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        documents: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            createdAt: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            createdAt: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    }) as unknown as CaseWithRelations[];

    // Transform the data to match the frontend's expected format
    const formattedCases = cases.map((caseItem) => {
      const lastDocument = caseItem.documents[0];
      const lastMessage = caseItem.messages[0];
      const lastActivity = [lastDocument?.createdAt, lastMessage?.createdAt, caseItem.updatedAt]
        .filter(Boolean)
        .sort((a, b) => new Date(b as Date).getTime() - new Date(a as Date).getTime())[0];
      
      return {
        id: caseItem.id,
        title: caseItem.title,
        client: caseItem.client.name || 'Client',
        status: caseItem.status,
        priority: caseItem.priority,
        startDate: caseItem.createdAt.toISOString().split('T')[0],
        nextHearing: caseItem.dueDate ? caseItem.dueDate.toISOString().split('T')[0] : 'Not scheduled',
        value: caseItem.value ? `$${caseItem.value.toLocaleString()}` : 'N/A',
        description: caseItem.description || '',
        lastActivity: lastActivity ? new Date(lastActivity).toISOString() : caseItem.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(formattedCases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
