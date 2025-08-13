"use client"

import { useState, useEffect } from "react"
import { Bell, X, Check, AlertCircle, Info, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { dataService, type Notification } from "@/lib/data-service"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface NotificationSystemProps {
  userId: string
}

export function NotificationSystem({ userId }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Only load notifications if we have a valid userId, user is authenticated, and user exists
    if (userId && userId !== "1" && user) {
      loadNotifications()
    }
  }, [userId, user])

  const loadNotifications = async () => {
    // Check if user is authenticated before making the request
    if (!user) {
      console.log("User not authenticated, skipping notification load")
      return
    }

    try {
      setLoading(true)
      const data = await dataService.getNotifications(userId)
      setNotifications(data)
    } catch (error) {
      console.error("Error loading notifications:", error)
      // If it's an authentication error, don't show it as an error
      if (error instanceof Error && error.message.includes("Not authenticated")) {
        console.log("User not authenticated, skipping notification load")
      }
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    // Check if user is authenticated before making the request
    if (!user) {
      console.log("User not authenticated, skipping mark as read")
      return
    }

    try {
      await dataService.markNotificationAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    // Check if user is authenticated before making the request
    if (!user) {
      console.log("User not authenticated, skipping mark all as read")
      return
    }

    try {
      const unreadNotifications = notifications.filter((n) => !n.read)
      await Promise.all(unreadNotifications.map((n) => dataService.markNotificationAsRead(n.id)))
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }

    setIsOpen(false)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  // Don't render the notification system if user is not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" className="relative p-2" onClick={() => setIsOpen(!isOpen)}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-500">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-sm text-slate-500 mt-2">Loading notifications...</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        {getIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p
                              className={`text-sm font-medium ${
                                !notification.read ? "text-slate-900" : "text-slate-700"
                              }`}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2">{notification.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-slate-400">
                              {new Date(notification.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {notification.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No notifications</p>
                  <p className="text-sm text-slate-400">You're all caught up!</p>
                </div>
              )}
            </ScrollArea>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    router.push("/notifications")
                    setIsOpen(false)
                  }}
                >
                  View all notifications
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
