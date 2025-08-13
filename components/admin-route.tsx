"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../contexts/auth-context"
import { useEffect } from "react"

interface AdminRouteProps {
  children: React.ReactNode
  adminEmails?: string[]
}

const AdminRoute: React.FC<AdminRouteProps> = ({
  children,
  adminEmails = ["admin@legalmentor.pk", "superadmin@legalmentor.pk"],
}) => {
  const { isAuthenticated, user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user && !adminEmails.includes(user.email)) {
      // Redirect non-admin users to their appropriate dashboard
      if (user.accountType === "lawyer") {
        router.push("/dashboard")
      } else if (user.accountType === "client") {
        router.push("/chat")
      } else {
        router.push("/")
      }
      return
    }
  }, [isAuthenticated, user, loading, router, adminEmails])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  // If not authenticated or not admin, don't render children
  if (!isAuthenticated || (user && !adminEmails.includes(user.email))) {
    return null
  }

  return <>{children}</>
}

export default AdminRoute
