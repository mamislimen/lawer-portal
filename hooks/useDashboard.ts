import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

export type DashboardStats = {
  activeCases: number
  unreadMessages: number
  upcomingMeetings: number
  pendingDocuments: number
}

type Activity = {
  id: string
  type: string
  title: string
  date: string
  status: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS'
  description?: string
}

type DashboardData = {
  stats: DashboardStats
  recentActivity: Activity[]
}

export function useDashboard() {
  const { data: session } = useSession()

  return useQuery<DashboardData, Error>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/client/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      return response.json()
    },
    enabled: !!session?.user,
  })
}
