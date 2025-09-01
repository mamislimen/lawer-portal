import { PrismaClient } from '@prisma/client';

async function testConnection() {
  console.log('Testing database connection...');
  
  // Create a new Prisma client with explicit connection URL
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    log: ['query', 'info', 'warn', 'error']
  });

  try {
    // Test the connection
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
    
    // Try a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in the database`);
    
    // List users with their roles
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      
      console.log('\nRecent users:');
      console.table(users);
      
      // Check if lawyer@example.com exists
      const lawyer = await prisma.user.findUnique({
        where: { email: 'lawyer@example.com' },
        include: { lawyerProfile: true }
      });
      
      if (lawyer) {
        console.log('\n🔍 Found lawyer@example.com:');
        console.table([{
          id: lawyer.id,
          email: lawyer.email,
          role: lawyer.role,
          hasPassword: !!lawyer.password,
          hasLawyerProfile: !!lawyer.lawyerProfile,
          createdAt: lawyer.createdAt
        }]);
      } else {
        console.log('\n❌ lawyer@example.com not found in the database');
      }
    }
    
  } catch (error) {
    console.error('❌ Error connecting to the database:');
    console.error(error);
    
    if (error.code === 'P1001') {
      console.error('\n🔧 Troubleshooting tips:');
      console.error('1. Check if your database server is running');
      console.error('2. Verify the DATABASE_URL in your .env file');
      console.error('3. Check if your IP is whitelisted in the database firewall');
      console.error('4. Try using the DIRECT_URL from .env instead of DATABASE_URL');
    }
    
  } finally {
    await prisma.$disconnect();
    console.log('\nDatabase connection closed');
  }
}

testConnection();
