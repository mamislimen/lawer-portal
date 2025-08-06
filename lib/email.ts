import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export class EmailService {
  async sendWelcomeEmail(to: string, name: string, role: "lawyer" | "client") {
    try {
      const subject =
        role === "lawyer"
          ? "Welcome to LegalPortal - Start Managing Your Practice"
          : "Welcome to LegalPortal - Your Legal Journey Begins"

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937;">Welcome to LegalPortal, ${name}!</h1>
          <p>Thank you for joining our platform. We're excited to help you with your legal ${role === "lawyer" ? "practice" : "needs"}.</p>
          
          ${
            role === "lawyer"
              ? `
            <h2>Getting Started:</h2>
            <ul>
              <li>Complete your lawyer profile</li>
              <li>Set your availability</li>
              <li>Start accepting clients</li>
            </ul>
          `
              : `
            <h2>What's Next:</h2>
            <ul>
              <li>Browse available lawyers</li>
              <li>Schedule your first consultation</li>
              <li>Upload relevant documents</li>
            </ul>
          `
          }
          
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" 
             style="background: #1f2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            Access Your Dashboard
          </a>
          
          <p>If you have any questions, don't hesitate to contact our support team.</p>
          <p>Best regards,<br>The LegalPortal Team</p>
        </div>
      `

      await resend.emails.send({
        from: "LegalPortal <noreply@legalportal.com>",
        to,
        subject,
        html,
      })

      return { success: true }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Unknown error", error);
      }
      
    }
  }

  async sendAppointmentReminder(to: string, appointment: any) {
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937;">Appointment Reminder</h1>
          <p>This is a reminder about your upcoming appointment:</p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${appointment.title}</h3>
            <p><strong>Date:</strong> ${new Date(appointment.scheduledAt).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(appointment.scheduledAt).toLocaleTimeString()}</p>
            <p><strong>Duration:</strong> ${appointment.durationMinutes} minutes</p>
            ${appointment.location ? `<p><strong>Location:</strong> ${appointment.location}</p>` : ""}
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/appointments" 
             style="background: #1f2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Appointment Details
          </a>
        </div>
      `

      await resend.emails.send({
        from: "LegalPortal <noreply@legalportal.com>",
        to,
        subject: `Appointment Reminder: ${appointment.title}`,
        html,
      })

      return { success: true }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Unknown error", error);
      }
      
    }
  }

  async sendCaseUpdateNotification(to: string, caseUpdate: any) {
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937;">Case Update</h1>
          <p>There's been an update to your case:</p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${caseUpdate.caseTitle}</h3>
            <p><strong>Update:</strong> ${caseUpdate.description}</p>
            <p><strong>Status:</strong> ${caseUpdate.status}</p>
            <p><strong>Updated by:</strong> ${caseUpdate.updatedBy}</p>
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/cases/${caseUpdate.caseId}" 
             style="background: #1f2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Case Details
          </a>
        </div>
      `

      await resend.emails.send({
        from: "LegalPortal <noreply@legalportal.com>",
        to,
        subject: `Case Update: ${caseUpdate.caseTitle}`,
        html,
      })

      return { success: true }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Unknown error", error);
      }
      
    }
  }
}
