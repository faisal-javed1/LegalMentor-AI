"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../contexts/auth-context"
import { useEffect, useState } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<"lawyer" | "client" | "admin">
  requireAuth?: boolean
  redirectTo?: string
  permissions?: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ["lawyer", "client"],
  requireAuth = true,
  redirectTo,
  permissions = [],
}) => {
  const { isAuthenticated, user, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (loading) return

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
      router.push(redirectTo || `/login?returnUrl=${returnUrl}`)
      return
    }

    // Check role authorization
    if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.accountType)) {
      // Redirect based on user role
      switch (user.accountType) {
        case "lawyer":
          router.push("/dashboard")
          break
        case "client":
          router.push("/chat")
          break
        case "admin":
          router.push("/admin")
          break
        default:
          router.push("/")
      }
      return
    }

    // Check specific permissions if provided
    if (permissions.length > 0 && user) {
      // In a real app, check user permissions against required permissions
      const hasPermissions = permissions.every((permission) => {
        // Mock permission check - implement actual logic based on your permission system
        return true
      })

      if (!hasPermissions) {
        router.push("/unauthorized")
        return
      }
    }

    setIsAuthorized(true)
    setIsLoading(false)
  }, [isAuthenticated, user, loading, router, allowedRoles, requireAuth, redirectTo, permissions])

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authorized, don't render children
  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute
