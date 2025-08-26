import { getServerSession } from 'next-auth'; // ✅ fixed import
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export type UserRole = "LAWYER" | "CLIENT" | "ADMIN"

export async function requireAuth(allowedRoles?: UserRole[]) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role as UserRole)) {
    redirect("/unauthorized")
  }

  return session
}

export function hasPermission(
  userRole: UserRole,
  requiredPermission: string,
): boolean {
  const permissions = {
    basic: ["view_cases", "send_messages", "schedule_appointments"],
    premium: ["view_cases", "send_messages", "schedule_appointments", "video_calls", "document_upload"],
    enterprise: ["*"], // All permissions
  }

  const rolePermissions = {
    CLIENT: permissions.basic,
    LAWYER: ["*"], // Lawyers have all permissions
    ADMIN: ["*"], // Admins have all permissions
  }

  const userPermissions = rolePermissions[userRole] || []
  return userPermissions.includes("*") || userPermissions.includes(requiredPermission)
}
