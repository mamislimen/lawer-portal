import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting user migration...');
    
    // Create notification preferences for existing users who don't have them
    const usersWithoutPrefs = await prisma.user.findMany({
      where: {
        notificationPrefsId: null
      },
      select: {
        id: true
      }
    });

    console.log(`Found ${usersWithoutPrefs.length} users without notification preferences`);
    
    let updatedCount = 0;

    for (const user of usersWithoutPrefs) {
      try {
        // Create notification preferences for the user
        const notificationPrefs = await prisma.notificationPreferences.create({
          data: {
            email: true,
            sms: false,
            caseUpdates: true,
            appointmentReminders: true,
            reminderTime: '24h'
          }
        });

        // Update the user with the new notification preferences ID
        await prisma.user.update({
          where: { id: user.id },
          data: { notificationPrefsId: notificationPrefs.id }
        });

        updatedCount++;
        if (updatedCount % 10 === 0) {
          console.log(`Updated ${updatedCount} users...`);
        }
      } catch (error) {
        console.error(`Error updating user ${user.id}:`, error);
      }
    }

    console.log(`Migration completed. Updated ${updatedCount} users.`);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
