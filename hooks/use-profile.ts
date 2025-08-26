import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession, signOut } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

type ProfileData = {
  id: string
  name: string
  email: string
  image: string | null
  phone?: string
  address?: string
  dateOfBirth?: string | null
  occupation?: string
  clientProfile?: {
    emergencyContactName?: string
    emergencyContactPhone?: string
    emergencyContactRelation?: string
  } | null
  notificationPrefs?: {
    id: string
    email: boolean
    sms: boolean
    caseUpdates: boolean
    appointmentReminders: boolean
    reminderTime: string
  }
}

type UpdateProfileData = {
  name: string
  email: string
  phone?: string
  address?: string
  dateOfBirth?: string
  occupation?: string
  clientProfile?: {
    emergencyContactName?: string
    emergencyContactPhone?: string
    emergencyContactRelation?: string
  }
}

type NotificationPrefs = {
  email: boolean
  sms: boolean
  caseUpdates: boolean
  appointmentReminders: boolean
  reminderTime: string
}

type PasswordData = {
  currentPassword: string
  newPassword: string
}

export function useProfile() {
  const { data: session, update: updateSession } = useSession()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()

  // Fetch profile data
  const { data: profile, isLoading, isError } = useQuery<ProfileData>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch('/api/profile')
      if (!res.ok) {
        throw new Error('Failed to fetch profile')
      }
      return res.json()
    },
    enabled: !!session?.user?.email,
  })

  // Update profile
  const updateProfile = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update profile')
      }
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data)
      updateSession({ ...session, user: { ...session?.user, ...data } })
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Update profile photo
  const updateProfilePhoto = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/profile/photo', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update photo')
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      // Update the session with the new image
      updateSession({ user: { ...session?.user, image: data.image } })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been updated successfully.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Update notification preferences
  const updateNotifications = useMutation<ProfileData, Error, NotificationPrefs>({
    mutationFn: async (data) => {
      const response = await fetch('/api/profile/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update notifications')
      }
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.setQueryData<ProfileData>(['profile'], (old) => ({
        ...old!,
        notificationPrefs: data.notificationPrefs
      }))
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been updated.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Change password
  const changePassword = useMutation({
    mutationFn: async (data: PasswordData) => {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password')
      }
      
      return result
    },
    onSuccess: (data) => {
      toast({
        title: "Password updated",
        description: data.message || "Your password has been updated successfully.",
      })
      
      // Sign out the user and redirect to login page
      signOut({ callbackUrl: '/auth/signin?passwordChanged=true' })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while changing your password.",
        variant: "destructive",
      })
    },
  })

  return {
    profile,
    isLoading,
    isError,
    updateProfile: updateProfile.mutateAsync,
    updateProfilePhoto: updateProfilePhoto.mutateAsync,
    updateNotifications: updateNotifications.mutateAsync,
    changePassword: changePassword.mutateAsync,
    isUpdating: updateProfile.isPending || updateProfilePhoto.isPending || updateNotifications.isPending || changePassword.isPending,
  }
}
