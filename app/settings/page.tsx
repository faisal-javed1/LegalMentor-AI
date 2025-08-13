"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Settings, User, Bell, Shield, Palette, Save, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { dataService } from "@/lib/data-service"
import { validateForm, commonRules, type ValidationErrors } from "@/lib/validation"
import { toast } from "sonner"

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [initializing, setInitializing] = useState(true)

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    specialization: "",
    barNumber: "",
    yearsOfExperience: 0,
  })

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    caseUpdates: true,
    appointmentReminders: true,
    invoiceAlerts: true,
    teamUpdates: false,
  })

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    language: "en",
    timezone: "UTC-5",
    dateFormat: "MM/DD/YYYY",
  })

  const [errors, setErrors] = useState<ValidationErrors>({})

  // Load user profile and preferences on component mount
  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setInitializing(true)
      
      // Load user profile
      const profile = await dataService.getUserProfile()
      setProfileData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "", // This will be null for lawyers, so we use empty string
        specialization: profile.specialization || "",
        barNumber: profile.barNumber || "",
        yearsOfExperience: profile.yearsOfExperience || 0,
      })

      // Load user preferences
      const preferences = await dataService.getUserPreferences()
      if (preferences.notification_settings) {
        setNotificationSettings({
          emailNotifications: preferences.notification_settings.email_notifications ?? true,
          pushNotifications: preferences.notification_settings.push_notifications ?? true,
          caseUpdates: preferences.notification_settings.case_updates ?? true,
          appointmentReminders: preferences.notification_settings.appointment_reminders ?? true,
          invoiceAlerts: preferences.notification_settings.invoice_alerts ?? true,
          teamUpdates: preferences.notification_settings.team_updates ?? false,
        })
      }

      if (preferences.appearance_settings) {
        setAppearanceSettings({
          theme: preferences.appearance_settings.theme || "light",
          language: preferences.appearance_settings.language || "en",
          timezone: preferences.appearance_settings.timezone || "UTC-5",
          dateFormat: preferences.appearance_settings.date_format || "MM/DD/YYYY",
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      toast.error("Failed to load user data")
    } finally {
      setInitializing(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationRules = {
      name: { required: true, minLength: 2 },
      email: commonRules.email,
      phone: commonRules.phone,
      specialization: { required: true },
    }

    const validationErrors = validateForm(profileData, validationRules)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      setLoading(true)
      
      const updatedProfile = await dataService.updateUserProfile({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address || undefined, // Only send if not empty
        specialization: profileData.specialization,
        barNumber: profileData.barNumber,
        yearsOfExperience: profileData.yearsOfExperience,
      })

      // Update auth context with new user data
      if (updateUser) {
        await updateUser({
          name: updatedProfile.name,
          email: updatedProfile.email,
          phone: profileData.phone,
          specialization: profileData.specialization,
          barNumber: profileData.barNumber,
          yearsOfExperience: profileData.yearsOfExperience,
        })
      }

      toast.success("Profile updated successfully!")
      setErrors({})
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationRules = {
      currentPassword: { required: true },
      newPassword: { required: true, minLength: 8 },
      confirmPassword: {
        required: true,
        custom: (value: string) => {
          if (value !== securityData.newPassword) {
            return "Passwords do not match"
          }
          return null
        },
      },
    }

    const validationErrors = validateForm(securityData, validationRules)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      setLoading(true)
      
      await dataService.changePassword({
        current_password: securityData.currentPassword,
        new_password: securityData.newPassword,
        confirm_password: securityData.confirmPassword,
      })

      toast.success("Password updated successfully!")
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setErrors({})
    } catch (error) {
      console.error("Error updating password:", error)
      toast.error("Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      
      await dataService.updateUserPreferences({
        notification_settings: {
          email_notifications: notificationSettings.emailNotifications,
          push_notifications: notificationSettings.pushNotifications,
          case_updates: notificationSettings.caseUpdates,
          appointment_reminders: notificationSettings.appointmentReminders,
          invoice_alerts: notificationSettings.invoiceAlerts,
          team_updates: notificationSettings.teamUpdates,
        }
      })

      toast.success("Notification preferences updated!")
    } catch (error) {
      console.error("Error updating notifications:", error)
      toast.error("Failed to update notification preferences")
    } finally {
      setLoading(false)
    }
  }

  const handleAppearanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      
      await dataService.updateUserPreferences({
        appearance_settings: {
          theme: appearanceSettings.theme,
          language: appearanceSettings.language,
          timezone: appearanceSettings.timezone,
          date_format: appearanceSettings.dateFormat,
        }
      })

      toast.success("Appearance settings updated!")
    } catch (error) {
      console.error("Error updating appearance:", error)
      toast.error("Failed to update appearance settings")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (section: string, field: string, value: string | boolean) => {
    switch (section) {
      case "profile":
        setProfileData((prev) => ({ ...prev, [field]: value }))
        break
      case "security":
        setSecurityData((prev) => ({ ...prev, [field]: value }))
        break
      case "notifications":
        setNotificationSettings((prev) => ({ ...prev, [field]: value }))
        break
      case "appearance":
        setAppearanceSettings((prev) => ({ ...prev, [field]: value }))
        break
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <ProtectedRoute allowedRoles={["lawyer"]}>
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 flex items-center">
              <Settings className="h-8 w-8 mr-3 text-indigo-600" />
              Settings
            </h1>
            <p className="text-slate-600 mt-1">Manage your account and application preferences</p>
          </div>

          {/* Loading State */}
          {initializing && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-slate-600">Loading settings...</span>
            </div>
          )}

          {/* Settings Tabs */}
          {!initializing && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center">
                  <Palette className="h-4 w-4 mr-2" />
                  Appearance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal and professional details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => handleInputChange("profile", "name", e.target.value)}
                            className={errors.name ? "border-red-500" : ""}
                          />
                          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => handleInputChange("profile", "email", e.target.value)}
                            className={errors.email ? "border-red-500" : ""}
                          />
                          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => handleInputChange("profile", "phone", e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className={errors.phone ? "border-red-500" : ""}
                          />
                          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>

                        <div>
                          <Label htmlFor="specialization">Specialization *</Label>
                          <Select
                            value={profileData.specialization}
                            onValueChange={(value) => handleInputChange("profile", "specialization", value)}
                          >
                            <SelectTrigger className={errors.specialization ? "border-red-500" : ""}>
                              <SelectValue placeholder="Select specialization" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Corporate Law">Corporate Law</SelectItem>
                              <SelectItem value="Criminal Law">Criminal Law</SelectItem>
                              <SelectItem value="Family Law">Family Law</SelectItem>
                              <SelectItem value="Real Estate Law">Real Estate Law</SelectItem>
                              <SelectItem value="Personal Injury">Personal Injury</SelectItem>
                              <SelectItem value="Immigration Law">Immigration Law</SelectItem>
                              <SelectItem value="Tax Law">Tax Law</SelectItem>
                              <SelectItem value="Employment Law">Employment Law</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>}
                        </div>

                        <div>
                          <Label htmlFor="barNumber">Bar Number</Label>
                          <Input
                            id="barNumber"
                            value={profileData.barNumber}
                            onChange={(e) => handleInputChange("profile", "barNumber", e.target.value)}
                            placeholder="Your bar number"
                          />
                        </div>

                        <div>
                          <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                          <Input
                            id="yearsOfExperience"
                            type="number"
                            value={profileData.yearsOfExperience}
                            onChange={(e) => handleInputChange("profile", "yearsOfExperience", parseInt(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            max="50"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address">Business Address (Optional)</Label>
                        <Textarea
                          id="address"
                          value={profileData.address}
                          onChange={(e) => handleInputChange("profile", "address", e.target.value)}
                          placeholder="Your business address (optional for lawyers)"
                          rows={3}
                        />
                      </div>

                      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Saving..." : "Save Profile"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your account password for better security</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSecuritySubmit} className="space-y-6">
                      <div>
                        <Label htmlFor="currentPassword">Current Password *</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPassword ? "text" : "password"}
                            value={securityData.currentPassword}
                            onChange={(e) => handleInputChange("security", "currentPassword", e.target.value)}
                            className={errors.currentPassword ? "border-red-500" : ""}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
                      </div>

                      <div>
                        <Label htmlFor="newPassword">New Password *</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={securityData.newPassword}
                          onChange={(e) => handleInputChange("security", "newPassword", e.target.value)}
                          className={errors.newPassword ? "border-red-500" : ""}
                        />
                        {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                        <p className="text-sm text-slate-500 mt-1">Password must be at least 8 characters long</p>
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={securityData.confirmPassword}
                          onChange={(e) => handleInputChange("security", "confirmPassword", e.target.value)}
                          className={errors.confirmPassword ? "border-red-500" : ""}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                      </div>

                      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                        <Shield className="h-4 w-4 mr-2" />
                        {loading ? "Updating..." : "Update Password"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security to your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable 2FA</p>
                        <p className="text-sm text-slate-500">Secure your account with two-factor authentication</p>
                      </div>
                      <Switch />
                    </div>
                    <Separator className="my-4" />
                    <Button variant="outline">Configure 2FA</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose how you want to be notified about important updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleNotificationSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-slate-500">Receive notifications via email</p>
                          </div>
                          <Switch
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={(checked) =>
                              handleInputChange("notifications", "emailNotifications", checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Push Notifications</p>
                            <p className="text-sm text-slate-500">Receive push notifications in your browser</p>
                          </div>
                          <Switch
                            checked={notificationSettings.pushNotifications}
                            onCheckedChange={(checked) =>
                              handleInputChange("notifications", "pushNotifications", checked)
                            }
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Case Updates</p>
                            <p className="text-sm text-slate-500">Get notified when cases are updated</p>
                          </div>
                          <Switch
                            checked={notificationSettings.caseUpdates}
                            onCheckedChange={(checked) => handleInputChange("notifications", "caseUpdates", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Appointment Reminders</p>
                            <p className="text-sm text-slate-500">Receive reminders for upcoming appointments</p>
                          </div>
                          <Switch
                            checked={notificationSettings.appointmentReminders}
                            onCheckedChange={(checked) =>
                              handleInputChange("notifications", "appointmentReminders", checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Invoice Alerts</p>
                            <p className="text-sm text-slate-500">Get notified about invoice status changes</p>
                          </div>
                          <Switch
                            checked={notificationSettings.invoiceAlerts}
                            onCheckedChange={(checked) => handleInputChange("notifications", "invoiceAlerts", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Team Updates</p>
                            <p className="text-sm text-slate-500">Receive notifications about team activities</p>
                          </div>
                          <Switch
                            checked={notificationSettings.teamUpdates}
                            onCheckedChange={(checked) => handleInputChange("notifications", "teamUpdates", checked)}
                          />
                        </div>
                      </div>

                      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                        <Bell className="h-4 w-4 mr-2" />
                        {loading ? "Saving..." : "Save Preferences"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>Customize how the application looks and feels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAppearanceSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="theme">Theme</Label>
                          <Select
                            value={appearanceSettings.theme}
                            onValueChange={(value) => handleInputChange("appearance", "theme", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="language">Language</Label>
                          <Select
                            value={appearanceSettings.language}
                            onValueChange={(value) => handleInputChange("appearance", "language", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="timezone">Timezone</Label>
                          <Select
                            value={appearanceSettings.timezone}
                            onValueChange={(value) => handleInputChange("appearance", "timezone", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                              <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                              <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                              <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                              <SelectItem value="UTC+0">UTC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="dateFormat">Date Format</Label>
                          <Select
                            value={appearanceSettings.dateFormat}
                            onValueChange={(value) => handleInputChange("appearance", "dateFormat", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                        <Palette className="h-4 w-4 mr-2" />
                        {loading ? "Saving..." : "Save Settings"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
