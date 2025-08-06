"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bell, Shield, Save, Phone, Mail, MapPin } from "lucide-react"

export default function ClientProfilePage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [caseUpdates, setCaseUpdates] = useState(true)
  const [appointmentReminders, setAppointmentReminders] = useState(true)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground text-lg">Manage your account information and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="text-lg">JS</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline">Change Photo</Button>
                  <p className="text-sm text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Smith" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" defaultValue="john.smith@email.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input id="phone" defaultValue="+1 (555) 123-4567" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-3" />
                  <Textarea
                    id="address"
                    placeholder="Your address..."
                    defaultValue="123 Main Street, Apt 4B&#10;New York, NY 10001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" defaultValue="1985-06-15" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input id="occupation" defaultValue="Software Engineer" />
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Contact Name</Label>
                  <Input id="emergencyName" defaultValue="Jane Smith" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyRelation">Relationship</Label>
                  <Input id="emergencyRelation" defaultValue="Spouse" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Phone Number</Label>
                <Input id="emergencyPhone" defaultValue="+1 (555) 987-6543" />
              </div>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Save className="h-4 w-4" />
                Update Emergency Contact
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your cases and appointments
                  </p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive text messages for urgent updates</p>
                </div>
                <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Case Updates</Label>
                  <p className="text-sm text-muted-foreground">Get notified when there are updates to your cases</p>
                </div>
                <Switch checked={caseUpdates} onCheckedChange={setCaseUpdates} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Appointment Reminders</Label>
                  <p className="text-sm text-muted-foreground">Receive reminders before scheduled appointments</p>
                </div>
                <Switch checked={appointmentReminders} onCheckedChange={setAppointmentReminders} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminderTime">Reminder Timing</Label>
                <Select defaultValue="24h">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hour before</SelectItem>
                    <SelectItem value="2h">2 hours before</SelectItem>
                    <SelectItem value="24h">24 hours before</SelectItem>
                    <SelectItem value="48h">48 hours before</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Currently disabled</p>
                </div>
                <Button variant="outline" className="bg-transparent">
                  Enable 2FA
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Login Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Current Session</p>
                    <p className="text-sm text-muted-foreground">New York, NY • Chrome on Windows</p>
                  </div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Previous Session</p>
                    <p className="text-sm text-muted-foreground">New York, NY • Safari on iPhone</p>
                  </div>
                  <span className="text-sm text-muted-foreground">2 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
