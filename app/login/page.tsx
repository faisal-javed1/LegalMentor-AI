"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { BookOpen, Scale } from "lucide-react"
import { useAuth } from "../../contexts/auth-context"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user, isAuthenticated } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User authenticated:", user)
      console.log("User account type:", user.accountType)
      
      const returnUrl = searchParams.get("returnUrl")
      if (returnUrl) {
        router.push(decodeURIComponent(returnUrl))
      } else {
        // Redirect based on user role
        switch (user.accountType) {
          case "lawyer":
            console.log("Redirecting lawyer to dashboard")
            router.push("/dashboard")
            break
          case "client":
            console.log("Redirecting client to chat")
            router.push("/chat")
            break
          case "admin":
            console.log("Redirecting admin to admin")
            router.push("/admin")
            break
          default:
            console.log("Redirecting to default page")
            router.push("/")
        }
      }
    }
  }, [isAuthenticated, user, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await login(email, password, rememberMe)

      if (result.success) {
        // Get the current user after successful login
        const returnUrl = searchParams.get("returnUrl")

        // Small delay to ensure user state is updated
        setTimeout(() => {
          if (returnUrl) {
            router.push(decodeURIComponent(returnUrl))
          } else {
            // Get user from localStorage as a fallback
            const currentUser = localStorage.getItem("currentUser")
            console.log("Current user from localStorage:", currentUser)
            
            if (currentUser) {
              const userData = JSON.parse(currentUser)
              console.log("Parsed user data:", userData)
              console.log("User account type from localStorage:", userData.accountType)
              console.log("User account type type:", typeof userData.accountType)
              console.log("All user data keys:", Object.keys(userData))
              
              // Also check the auth context user
              console.log("Auth context user:", user)
              console.log("Auth context user account type:", user?.accountType)
              
              // Use auth context user if available, otherwise fallback to localStorage
              const userToCheck = user || userData
              const accountType = userToCheck.accountType
              
              console.log("Final account type to use:", accountType)
              console.log("Final account type type:", typeof accountType)
              
              switch (accountType) {
                case "lawyer":
                  console.log("Redirecting lawyer to dashboard (from localStorage)")
                  router.push("/dashboard")
                  break
                case "client":
                  console.log("Redirecting client to chat (from localStorage)")
                  router.push("/chat")
                  break
                case "admin":
                  console.log("Redirecting admin to admin (from localStorage)")
                  router.push("/admin")
                  break
                default:
                  console.log("Redirecting to default page (from localStorage)")
                  router.push("/")
              }
            } else {
              console.log("No user data in localStorage, redirecting to dashboard")
              router.push("/dashboard") // Default fallback
            }
          }
        }, 100)
      } else if (result.requiresTwoFactor) {
        router.push("/verify-2fa")
      } else {
        setError(result.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Wave pattern background */}
      <div className="absolute inset-0 z-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1000 1000"
        >
          <defs>
            <linearGradient id="nightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#0f172a", stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: "#1e293b", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#0f172a", stopOpacity: 1 }} />
            </linearGradient>
            <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" style={{ stopColor: "#e2e8f0", stopOpacity: 0.1 }} />
              <stop offset="100%" style={{ stopColor: "#94a3b8", stopOpacity: 0 }} />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#nightGrad)" />
          <g opacity="0.1">
            <path d="M0,300 Q250,250 500,300 T1000,300" stroke="#94a3b8" fill="none" strokeWidth="2" />
            <path d="M0,500 Q250,450 500,500 T1000,500" stroke="#94a3b8" fill="none" strokeWidth="2" />
            <path d="M0,700 Q250,650 500,700 T1000,700" stroke="#94a3b8" fill="none" strokeWidth="2" />
          </g>
          <g opacity="0.15">
            <circle cx="300" cy="300" r="100" fill="url(#glowGrad)" />
            <circle cx="700" cy="700" r="100" fill="url(#glowGrad)" />
          </g>
          <g opacity="0.1" stroke="#94a3b8" fill="none" strokeWidth="2">
            <path d="M450,400 L550,400 L500,500 Z" />
            <circle cx="500" cy="450" r="20" />
          </g>
        </svg>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-gray-900/50 backdrop-blur-sm" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-gray-200/20">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <Scale className="w-full h-full text-gray-400 opacity-10" />
              </div>
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-gray-100 to-white rounded-full p-3 shadow-lg">
                  <BookOpen className="h-10 w-10 text-slate-800" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-100">LegalMentor</h2>
              <p className="text-gray-300 mt-2">Professional Legal Assistant</p>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-slate-600 shadow-sm focus:border-slate-300 focus:ring focus:ring-slate-200 focus:ring-opacity-50"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4" role="alert">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:from-slate-800 hover:to-slate-900 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between">
                <Link href="/forgot-password" className="text-sm text-slate-700 hover:text-slate-900 font-semibold">
                  Forgot password?
                </Link>
                <Link
                  href="/account-type-selection"
                  className="text-sm text-slate-700 hover:text-slate-900 font-semibold"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 space-y-2">
            <p className="text-gray-300 text-sm">Secure • Professional • Reliable</p>
            <p className="text-gray-400 text-xs">Trusted legal guidance at your service</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
