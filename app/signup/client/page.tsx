"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, Scale, Check, X, Eye, EyeOff } from "lucide-react"
import { useAuth } from "../../../contexts/auth-context"

const ClientSignup = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { register, isAuthenticated, user, loading } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.accountType === "client") {
        router.push("/chat")
      } else {
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, user, router])

  // Password validation functions
  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "weak"

    const hasUpperCase = /[A-Z]/.test(pass)
    const hasLowerCase = /[a-z]/.test(pass)
    const hasNumbers = /\d/.test(pass)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass)

    const strength = (hasUpperCase ? 1 : 0) + (hasLowerCase ? 1 : 0) + (hasNumbers ? 1 : 0) + (hasSpecialChar ? 1 : 0)

    if (strength < 2) return "weak"
    if (strength < 4) return "medium"
    return "strong"
  }

  const getPasswordStrengthColor = (strength: string) => {
    switch (strength) {
      case "weak":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "strong":
        return "bg-green-500"
      default:
        return "bg-gray-200"
    }
  }

  useEffect(() => {
    if (password) {
      setPasswordStrength(validatePassword(password))
    } else {
      setPasswordStrength("")
    }
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 8 || password.length > 14) {
      setError("Password must be between 8 and 14 characters")
      return
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter")
      return
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter")
      return
    }

    if (!/\d/.test(password)) {
      setError("Password must contain at least one number")
      return
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError("Password must contain at least one special character")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    try {
      const result = await register({
        name,
        email,
        password,
        accountType: "client",
      })

      if (result.success) {
        // Registration successful, redirect will happen via useEffect
        router.push("/chat")
      } else {
        setError(result.error || "Registration failed")
      }
    } catch (error) {
      console.error("Signup error:", error)
      setError("An error occurred during signup")
    }
  }

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center space-x-2 text-sm">
      {met ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
      <span className={met ? "text-green-700" : "text-gray-600"}>{text}</span>
    </div>
  )

  return (
    <div className="min-h-screen relative">
      {/* Background */}
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
          {/* Signup Card */}
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
              <p className="text-gray-300 mt-2">Create Client Account</p>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email"
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
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 rounded-full bg-gray-200">
                          <div
                            className={`h-2 rounded-full transition-all ${getPasswordStrengthColor(passwordStrength)}`}
                            style={{
                              width:
                                passwordStrength === "weak" ? "33%" : passwordStrength === "medium" ? "66%" : "100%",
                            }}
                          />
                        </div>
                        <span className="text-sm capitalize text-gray-600">{passwordStrength}</span>
                      </div>

                      {/* Password requirements */}
                      <div className="mt-3 space-y-2">
                        <PasswordRequirement
                          met={password.length >= 8 && password.length <= 14}
                          text="8-14 characters"
                        />
                        <PasswordRequirement met={/[A-Z]/.test(password)} text="One uppercase letter" />
                        <PasswordRequirement met={/[a-z]/.test(password)} text="One lowercase letter" />
                        <PasswordRequirement met={/\d/.test(password)} text="One number" />
                        <PasswordRequirement
                          met={/[!@#$%^&*(),.?":{}|<>]/.test(password)}
                          text="One special character"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
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
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <span className="text-sm text-slate-700">Already have an account? </span>
                <Link href="/login" className="text-sm text-slate-700 hover:text-slate-900 font-semibold">
                  Log in
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

export default ClientSignup
