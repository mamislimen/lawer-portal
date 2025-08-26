import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        notifications: true,  // ✅ works because User has a relation
      },
    })
    

    return NextResponse.json(users);
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}

export async function POST() {
  try {
    // First, get a user to associate with the preferences
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return NextResponse.json(
        { error: "No users found in the database" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to Our Platform",
        message: "Thank you for joining our platform!",
        type: "APPOINTMENT_CREATED",
        isRead: false
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error creating prefs:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
