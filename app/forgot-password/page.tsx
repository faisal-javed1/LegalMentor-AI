"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { BookOpen, Scale } from "lucide-react"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setMessage("Password reset link sent to your email")
      setLoading(false)
    }, 1500)
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
          {/* Password Reset Card */}
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
              <p className="text-gray-300 mt-2">Password Recovery</p>
            </div>

            {/* Form */}
            <div className="p-8">
              <div className="mb-6 text-center">
                <p className="text-gray-600 text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {message && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4" role="alert">
                    <p className="text-green-500 text-sm">{message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:from-slate-800 hover:to-slate-900 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending Reset Link..." : "Reset Password"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm text-slate-700 hover:text-slate-900 font-semibold transition-colors"
                >
                  Back to Login
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

export default ForgotPassword
