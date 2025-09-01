import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'lawyer@example.com';
  const newPassword = 'password123';
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update or create the lawyer user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
    },
    create: {
      email,
      name: 'John Smith',
      password: hashedPassword,
      role: 'LAWYER',
      lawyerProfile: {
        create: {
          barNumber: 'BAR123456',
          specialization: ['Corporate Law', 'Contract Law'],
          experience: 10,
          hourlyRate: 350.0,
          bio: 'Experienced corporate lawyer with 10+ years in contract negotiations and business law.',
        },
      },
    },
  });

  console.log(`Password reset for ${email}. New password: ${newPassword}`);
  console.log('User details:', JSON.stringify(user, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
