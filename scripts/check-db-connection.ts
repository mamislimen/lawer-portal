import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

async function main() {
  try {
    console.log('Testing database connection...');
    
    // Test connection with a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Successfully connected to the database. Found ${userCount} users.`);
    
    // Check lawyer@example.com
    const lawyer = await prisma.user.findUnique({
      where: { email: 'lawyer@example.com' },
      include: { lawyerProfile: true }
    });
    
    if (lawyer) {
      console.log('\n🔍 Found lawyer@example.com:');
      console.log(JSON.stringify({
        id: lawyer.id,
        email: lawyer.email,
        role: lawyer.role,
        hasPassword: !!lawyer.password,
        hasLawyerProfile: !!lawyer.lawyerProfile,
        createdAt: lawyer.createdAt
      }, null, 2));
      
      // Update role to LAWYER if needed
      if (lawyer.role !== 'LAWYER') {
        console.log('\n🔄 Updating role to LAWYER...');
        await prisma.user.update({
          where: { id: lawyer.id },
          data: { role: 'LAWYER' }
        });
        console.log('✅ Role updated to LAWYER');
      }
      
      // Create lawyer profile if it doesn't exist
      if (!lawyer.lawyerProfile) {
        console.log('\n🔄 Creating lawyer profile...');
        await prisma.lawyerProfile.create({
          data: {
            userId: lawyer.id,
            specialization: ['Corporate Law', 'Contract Law'],
            experience: 10,
            barNumber: `BAR-${Date.now()}`,
            hourlyRate: 350.0,
            bio: 'Experienced corporate lawyer with 10+ years in contract negotiations and business law.'
          }
        });
        console.log('✅ Lawyer profile created');
      }
    } else {
      console.log('\n❌ lawyer@example.com not found in the database');
    }
    
  } catch (error) {
    console.error('❌ Error connecting to the database:');
    console.error(error);
    
    if (error.code === 'P1001') {
      console.error('\n🔧 Troubleshooting tips:');
      console.error('1. Check if your database server is running');
      console.error('2. Verify the DATABASE_URL in your .env file');
      console.error('3. Check if your IP is whitelisted in the database firewall');
    }
    
  } finally {
    await prisma.$disconnect();
    console.log('\nDatabase connection closed');
  }
}

main();
