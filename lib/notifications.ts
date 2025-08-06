import { prisma } from "@/lib/prisma"
import { EmailService } from "@/lib/email"

export class NotificationService {
  private emailService = new EmailService()

  // Create a new notification
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: "MESSAGE" | "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "VIDEO_CALL" | "DOCUMENT",
    actionUrl?: string,
  ) {
    try {
      // Save notification to the database
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
        },
      })

      // Send email notification if user preferences allow
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true }, // Replace `firstName` with `name`
      })

      if (user) {
        // Check user notification preferences here
        // For now, we'll send email for important notifications
        if (type === "WARNING" || type === "ERROR") {
          await this.emailService.sendCaseUpdateNotification(user.email, {
            caseTitle: title,
            description: message,
            status: "Updated",
            updatedBy: "System",
            caseId: actionUrl?.split("/").pop(),
          })
        }
      }

      return { success: true, notification }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message)
      } else {
        console.error("Unknown error", error)
      }
    }
  }

  // Mark a notification as read
  async markAsRead(notificationId: string, userId: string) {
    try {
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId, // Ensure user can only mark their own notifications
        },
        data: { read: true }, // Changed from `isRead` to `read`
      })

      return { success: true }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message)
      } else {
        console.error("Unknown error", error)
      }
    }
  }

  // Get unread notifications count
  async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          read: false, // Changed from `isRead` to `read`
        },
      })

      return { success: true, count }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message)
      } else {
        console.error("Unknown error", error)
      }
    }
  }
}
