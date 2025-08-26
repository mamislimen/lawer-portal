"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader, 
  CardTitle, 
  CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bell, Shield, Save, Phone, Mail, MapPin, Loader2 } from "lucide-react"
import { useProfile } from "@/hooks/use-profile"
import { format } from "date-fns"

// Form schemas
const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  occupation: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const passwordSchema = z.object({
  currentPassword: z.string().min(8, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(8, { message: "Please confirm your password" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

export default function ClientProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { 
    profile, 
    isLoading, 
    updateProfile, 
    updateProfilePhoto, 
    updateNotifications, 
    changePassword,
    isUpdating 
  } = useProfile()
  
  const isProcessing = isUpdating

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      occupation: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
    },
  })

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    sms: false,
    caseUpdates: true,
    appointmentReminders: true,
    reminderTime: "24h"
  })

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        dateOfBirth: profile.dateOfBirth ? format(new Date(profile.dateOfBirth), 'yyyy-MM-dd') : "",
        occupation: profile.occupation || "",
        emergencyContactName: profile.clientProfile?.emergencyContactName || "",
        emergencyContactPhone: profile.clientProfile?.emergencyContactPhone || "",
        emergencyContactRelation: profile.clientProfile?.emergencyContactRelation || "",
      })

      if (profile.notificationPrefs) {
        setNotificationPrefs({
          email: profile.notificationPrefs.email,
          sms: profile.notificationPrefs.sms,
          caseUpdates: profile.notificationPrefs.caseUpdates,
          appointmentReminders: profile.notificationPrefs.appointmentReminders,
          reminderTime: profile.notificationPrefs.reminderTime || "24h"
        })
      }
    }
  }, [profile, profileForm])

  // Update profile photo
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        await updateProfilePhoto(file)
      } catch (error) {
        console.error("Error updating profile photo:", error)
      }
    }
  }

  // Submit profile
  const onSubmitProfile = async (data: ProfileFormValues) => {
    try {
      await updateProfile({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        dateOfBirth: data.dateOfBirth,
        occupation: data.occupation,
        clientProfile: {
          emergencyContactName: data.emergencyContactName,
          emergencyContactPhone: data.emergencyContactPhone,
          emergencyContactRelation: data.emergencyContactRelation,
        }
      })
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  // Submit password change
  const onSubmitPassword = async (data: PasswordFormValues) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      passwordForm.reset()
    } catch (error) {
      console.error("Error changing password:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground text-lg">Manage your account information and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.image || "/placeholder-user.jpg"} />
                    <AvatarFallback className="text-lg">
                      {profile?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        'Change Photo'
                      )}
                    </Button>
                    <p className="text-sm text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    {...profileForm.register('name')} 
                    disabled={isProcessing}
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-sm text-red-500">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      {...profileForm.register('email')}
                      disabled={isProcessing}
                    />
                  </div>
                  {profileForm.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {profileForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      {...profileForm.register('phone')}
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-3" />
                    <Textarea
                      id="address"
                      placeholder="Your address..."
                      {...profileForm.register('address')}
                      disabled={isProcessing}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input 
                    id="dateOfBirth" 
                    type="date" 
                    {...profileForm.register('dateOfBirth')}
                    disabled={isProcessing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input 
                    id="occupation" 
                    {...profileForm.register('occupation')}
                    disabled={isProcessing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                  <Input 
                    id="emergencyContactName" 
                    {...profileForm.register('emergencyContactName')}
                    disabled={isProcessing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelation">Relationship</Label>
                  <Input 
                    id="emergencyContactRelation" 
                    {...profileForm.register('emergencyContactRelation')}
                    disabled={isProcessing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                  <Input 
                    id="emergencyContactPhone" 
                    {...profileForm.register('emergencyContactPhone')}
                    disabled={isProcessing}
                  />
                </div>

                <CardFooter className="flex justify-end p-0 pt-6">
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </CardFooter>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ... notification switches ... */}
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">Changes are saved automatically</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)}>
            {/* ... password card unchanged ... */}
          </form>

          {/* 2FA and Login Activity Cards unchanged */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
