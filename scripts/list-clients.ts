import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Listing all clients in the database...');
  
  try {
    // List all users with role CLIENT
    const clients = await prisma.user.findMany({
      where: {
        role: 'CLIENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        clientProfile: true,
        _count: {
          select: {
            clientCases: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('\n=== CLIENTS ===');
    console.table(clients.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      hasProfile: !!client.clientProfile,
      caseCount: client._count.clientCases
    })));

    // List all cases
    const cases = await prisma.case.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        clientId: true,
        client: {
          select: {
            name: true,
            email: true
          }
        },
        lawyer: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('\n=== CASES ===');
    console.table(cases.map(c => ({
      id: c.id,
      title: c.title,
      status: c.status,
      client: c.client?.name || c.clientId,
      clientEmail: c.client?.email,
      lawyer: c.lawyer?.name
    })));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
