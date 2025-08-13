"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Scale, Briefcase, MessageSquare, CheckCircle } from "lucide-react"

const AccountTypeSelection: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const router = useRouter()

  const handleSelection = (type: string) => {
    setSelectedType(type)
  }

  const handleContinue = () => {
    if (selectedType) {
      localStorage.setItem("selectedAccountType", selectedType)
      router.push(`/signup/${selectedType}`)
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
        <div className="w-full max-w-4xl">
          {/* Selection Card */}
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
              <p className="text-gray-300 mt-2">Select Your Account Type</p>
            </div>

            {/* Selection Options */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-slate-800">How will you use LegalMentor?</h3>
                <p className="text-slate-600 mt-2">Choose the account type that best fits your needs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Lawyer Option */}
                <div
                  className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedType === "lawyer"
                      ? "ring-4 ring-slate-700 shadow-xl"
                      : "border border-gray-200 shadow-md hover:shadow-lg"
                  }`}
                  onClick={() => handleSelection("lawyer")}
                >
                  {selectedType === "lawyer" && (
                    <div className="absolute top-3 right-3 z-10">
                      <CheckCircle className="h-6 w-6 text-slate-700" />
                    </div>
                  )}
                  <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-5 text-white">
                    <Briefcase className="h-8 w-8 mb-2" />
                    <h4 className="text-xl font-bold">Lawyer</h4>
                    <p className="text-gray-300 text-sm">For legal professionals</p>
                  </div>
                  <div className="p-5 bg-white">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-slate-700 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Full access to dashboard</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-slate-700 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Case management tools</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-slate-700 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Client communication</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-slate-700 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Legal research assistant</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Client Option */}
                <div
                  className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedType === "client"
                      ? "ring-4 ring-slate-700 shadow-xl"
                      : "border border-gray-200 shadow-md hover:shadow-lg"
                  }`}
                  onClick={() => handleSelection("client")}
                >
                  {selectedType === "client" && (
                    <div className="absolute top-3 right-3 z-10">
                      <CheckCircle className="h-6 w-6 text-slate-700" />
                    </div>
                  )}
                  <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-5 text-white">
                    <MessageSquare className="h-8 w-8 mb-2" />
                    <h4 className="text-xl font-bold">Client</h4>
                    <p className="text-gray-300 text-sm">For those seeking legal assistance</p>
                  </div>
                  <div className="p-5 bg-white">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-slate-700 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Access to chat functionality</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-slate-700 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Communicate with legal professionals</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-slate-700 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Document sharing</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-slate-700 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">Case status updates</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleContinue}
                  disabled={!selectedType}
                  className={`bg-gradient-to-r from-slate-700 to-slate-800 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
                    !selectedType ? "opacity-50 cursor-not-allowed" : "hover:from-slate-800 hover:to-slate-900"
                  }`}
                >
                  Continue as {selectedType ? (selectedType === "lawyer" ? "Lawyer" : "Client") : "..."}
                </button>
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

export default AccountTypeSelection
