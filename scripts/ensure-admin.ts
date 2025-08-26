import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "topadmin@example.com";
const ADMIN_PASSWORD = "topadmin";

async function ensureAdminUser() {
  try {
    console.log("Checking for admin user...");
    
    // Check if admin user exists
    let adminUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    if (!adminUser) {
      console.log("Admin user not found. Creating...");
      // Create admin user if it doesn't exist
      adminUser = await prisma.user.upsert({
        where: { email: ADMIN_EMAIL },
        update: {},
        create: {
          name: "Top Admin",
          email: ADMIN_EMAIL,
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: new Date(),
        },
      });
      console.log("Admin user created successfully!");
    } else {
      console.log("Admin user already exists. Updating password if needed...");
      // Update password if it's different
      const passwordMatch = await bcrypt.compare(ADMIN_PASSWORD, adminUser.password || '');
      if (!passwordMatch) {
        await prisma.user.update({
          where: { id: adminUser.id },
          data: { password: hashedPassword },
        });
        console.log("Admin password updated successfully!");
      } else {
        console.log("Admin password is up to date.");
      }
    }

    return adminUser;
  } catch (error) {
    console.error("Error ensuring admin user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
ensureAdminUser()
  .then(() => console.log("Admin user check completed successfully!"))
  .catch((error) => {
    console.error("Error during admin user check:", error);
    process.exit(1);
  });
