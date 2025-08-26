import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

export interface ClientCase {
  id: string
  title: string
  caseNumber: string
  status: 'ACTIVE' | 'PENDING' | 'CLOSED' | 'IN_REVIEW'
  nextHearingDate?: string
  startedAt: string
  description?: string
  clientId: string
  lawyerId: string
}

export interface Activity {
  id: string
  type: 'DOCUMENT_UPLOAD' | 'MESSAGE' | 'APPOINTMENT' | 'CASE_UPDATE'
  title: string
  description: string
  date: string
  caseId?: string
  documentUrl?: string
}

export function useClientCases() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['clientCases', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error('User not authenticated')
      
      const [cases, activities] = await Promise.all([
        fetch(`/api/client/cases`).then(res => {
          if (!res.ok) throw new Error('Failed to fetch cases')
          return res.json()
        }),
        fetch(`/api/client/activities`).then(res => {
          if (!res.ok) throw new Error('Failed to fetch activities')
          return res.json()
        })
      ])

      return { cases, activities }
    },
    enabled: !!session?.user?.id
  })
}
