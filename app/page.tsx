"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  BookOpen,
  Scale,
  Search,
  MessageSquare,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle,
  Database,
  BarChart2,
  LogIn,
  UserPlus,
  Menu,
  X,
} from "lucide-react"

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
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
      <div className="relative z-10">
        {/* Navigation - Fixed Mobile Header */}
        <nav className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              {/* Logo */}
              <div className="flex items-center flex-shrink-0">
                <div className="bg-gradient-to-br from-gray-100 to-white rounded-full p-2 shadow-lg mr-2">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-slate-800" />
                </div>
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  Legal<span className="text-gray-300">Mentor</span>
                </span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-8">
                <a
                  href="#features"
                  className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  Features
                </a>
                <a
                  href="#benefits"
                  className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  Benefits
                </a>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                  About
                </a>
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center font-medium"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Login
                </Link>
                <Link
                  href="/account-type-selection"
                  className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 py-2.5 rounded-lg font-medium hover:from-slate-800 hover:to-slate-900 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <button
                  className="text-white p-2 rounded-md hover:bg-white/10 transition-colors duration-200"
                  onClick={toggleMobileMenu}
                  aria-label="Toggle mobile menu"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            <div
              className={`lg:hidden transition-all duration-300 ease-in-out ${
                mobileMenuOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              <div className="border-t border-gray-600 pt-4">
                <div className="flex flex-col space-y-1">
                  <a
                    href="#features"
                    className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 px-4 py-3 rounded-md font-medium"
                    onClick={closeMobileMenu}
                  >
                    Features
                  </a>
                  <a
                    href="#benefits"
                    className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 px-4 py-3 rounded-md font-medium"
                    onClick={closeMobileMenu}
                  >
                    Benefits
                  </a>
                  <a
                    href="#about"
                    className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 px-4 py-3 rounded-md font-medium"
                    onClick={closeMobileMenu}
                  >
                    About
                  </a>
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 px-4 py-3 rounded-md flex items-center font-medium"
                    onClick={closeMobileMenu}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                  <div className="px-4 pt-2">
                    <Link
                      href="/account-type-selection"
                      className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 py-3 rounded-lg font-medium hover:from-slate-800 hover:to-slate-900 transition-all shadow-lg flex items-center justify-center w-full"
                      onClick={closeMobileMenu}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Sign Up
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section - Mobile Optimized */}
        <section className="pt-8 pb-12 sm:pt-16 sm:pb-20 md:pt-20 md:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Hero Content */}
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <div
                  className={`transition-all duration-1000 transform ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  }`}
                >
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-4 sm:mb-6">
                    AI-Powered Legal Research Assistant
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                    Revolutionize your legal research with our AI-powered platform. Find relevant case laws, citations,
                    and legal references in seconds.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <a
                      href="#features"
                      className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:from-slate-800 hover:to-slate-900 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center text-sm sm:text-base"
                    >
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Explore Features
                    </a>
                    <a
                      href="#about"
                      className="border-2 border-slate-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-slate-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center text-sm sm:text-base"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              </div>

              {/* Hero Demo */}
              <div className="w-full lg:w-1/2">
                <div
                  className={`bg-white/5 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/10 transition-all duration-1000 transform ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  }`}
                  style={{ transitionDelay: "200ms" }}
                >
                  {/* Browser Header */}
                  <div className="flex items-center mb-4 pb-3 border-b border-white/10">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="bg-slate-800 rounded px-3 py-1 text-xs text-gray-400 inline-block">
                        legalmentor.ai
                      </div>
                    </div>
                  </div>

                  {/* Chat Interface */}
                  <div className="space-y-3 sm:space-y-4">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-slate-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 max-w-[80%]">
                        <p className="text-gray-200 text-xs sm:text-sm">
                          What are the recent precedents for property disputes in Punjab?
                        </p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-full p-2 flex-shrink-0">
                        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-gray-300" />
                      </div>
                      <div className="bg-slate-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex-1">
                        <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                          I found 5 recent property dispute cases in Punjab. The most relevant precedent is{" "}
                          <span className="text-blue-400 font-medium">"Khan vs. Ahmad (2024)"</span> which established
                          that...
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="bg-slate-700 text-gray-300 px-2 py-1 rounded text-xs">Property Law</span>
                          <span className="bg-slate-700 text-gray-300 px-2 py-1 rounded text-xs">Punjab HC</span>
                          <span className="bg-slate-700 text-gray-300 px-2 py-1 rounded text-xs">2024</span>
                        </div>
                      </div>
                    </div>

                    {/* Input Area */}
                    <div className="flex items-center space-x-2 pt-2">
                      <div className="bg-slate-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex-1">
                        <p className="text-gray-400 text-xs sm:text-sm">Ask a legal question...</p>
                      </div>
                      <button className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-2 sm:p-3 hover:from-slate-800 hover:to-slate-900 transition-all">
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-300" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Mobile Optimized */}
        <section id="features" className="py-12 sm:py-16 md:py-20 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
                Powerful Features
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                LegalMentor combines cutting-edge AI technology with comprehensive legal databases to streamline your
                research process.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />,
                  title: "AI Legal Chatbot",
                  description:
                    "Get instant answers to legal questions and find relevant case precedents through our NLP-powered chatbot.",
                },
                {
                  icon: <Search className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />,
                  title: "Citation Search Engine",
                  description:
                    "Quickly search, filter, and retrieve case precedents based on keywords, case types, and years.",
                },
                {
                  icon: <BarChart2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />,
                  title: "Case Outcome Prediction",
                  description:
                    "Leverage historical case data to make informed predictions about likely court decisions.",
                },
                {
                  icon: <FileText className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />,
                  title: "Document Management",
                  description: "Securely store, organize, and access your legal documents from anywhere, anytime.",
                },
                {
                  icon: <Database className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />,
                  title: "Comprehensive Database",
                  description:
                    "Access Pakistan's largest collection of digitized case laws, statutes, and legal references.",
                },
                {
                  icon: <Clock className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />,
                  title: "Time-Saving Automation",
                  description:
                    "Automate citation retrieval and document analysis to save hours of manual research time.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 transition-all duration-700 transform hover:translate-y-[-8px] hover:bg-white/10 hover:border-white/20 group`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-full p-3 sm:p-4 inline-block mb-4 group-hover:from-slate-600 group-hover:to-slate-700 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section - Mobile Optimized */}
        <section id="benefits" className="py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              <div className="w-full lg:w-1/2 order-2 lg:order-1">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 text-center lg:text-left">
                  Why Choose LegalMentor?
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 text-center lg:text-left leading-relaxed">
                  Our platform is designed specifically for Pakistan's legal system, providing unparalleled advantages
                  for legal professionals.
                </p>

                <div className="space-y-3 sm:space-y-4">
                  {[
                    "Save up to 70% of research time with AI-powered search",
                    "Access comprehensive database of Pakistan's legal precedents",
                    "Improve case outcomes with data-driven insights",
                    "Streamline document management and case workflows",
                    "Stay updated with the latest legal developments",
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start group">
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5 group-hover:text-green-400 transition-colors duration-200" />
                      <p className="text-sm sm:text-base text-gray-300 group-hover:text-white transition-colors duration-200 leading-relaxed">
                        {benefit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-1/2 order-1 lg:order-2">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Testimonials</h3>
                    <p className="text-sm sm:text-base text-gray-300">What legal professionals are saying</p>
                  </div>
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {[
                      {
                        quote:
                          "LegalMentor has transformed how I prepare for cases. What used to take days now takes hours.",
                        author: "Faisal Ahmed",
                        role: "Corporate Lawyer, Lahore",
                      },
                      {
                        quote:
                          "The citation search engine is incredibly accurate. It's like having a legal research assistant available 24/7.",
                        author: "Ayesha Khan",
                        role: "Legal Consultant, Karachi",
                      },
                      {
                        quote:
                          "As a solo practitioner, LegalMentor gives me access to resources that were previously only available to large firms.",
                        author: "Muhammad Raza",
                        role: "Criminal Defense Attorney, Islamabad",
                      },
                    ].map((testimonial, index) => (
                      <div
                        key={index}
                        className="bg-white/5 rounded-lg p-3 sm:p-4 hover:bg-white/10 transition-all duration-300 group"
                      >
                        <p className="text-sm sm:text-base text-gray-300 italic mb-3 leading-relaxed group-hover:text-white transition-colors duration-200">
                          "{testimonial.quote}"
                        </p>
                        <div>
                          <p className="text-sm sm:text-base text-white font-medium">{testimonial.author}</p>
                          <p className="text-xs sm:text-sm text-gray-400">{testimonial.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section - Mobile Optimized */}
        <section id="about" className="py-12 sm:py-16 md:py-20 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
                About LegalMentor
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Developed by a team of legal and AI experts at the University of Management and Technology, LegalMentor
                aims to revolutionize legal research in Pakistan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  title: "Our Mission",
                  content:
                    "To make legal research more accessible, efficient, and accurate for legal professionals across Pakistan, ultimately improving access to justice.",
                },
                {
                  title: "Our Team",
                  content:
                    "A collaborative effort between legal experts, AI specialists, and software engineers dedicated to solving the challenges of legal research.",
                },
                {
                  title: "Our Technology",
                  content:
                    "Built using BERT-based NLP models, React.js frontend, Python backend, and PostgreSQL database to ensure performance and accuracy.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
                >
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4 group-hover:text-gray-100 transition-colors duration-200">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed group-hover:text-white transition-colors duration-200">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Mobile Optimized */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl border border-white/10 text-center relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="bg-gradient-to-br from-gray-100 to-white rounded-full p-3 sm:p-4 shadow-lg">
                    <Scale className="h-8 w-8 sm:h-10 sm:w-10 text-slate-800" />
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
                  Ready to Transform Your Legal Research?
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of legal professionals who are saving time and improving outcomes with LegalMentor.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                  <Link
                    href="/account-type-selection"
                    className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:from-slate-800 hover:to-slate-900 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center text-sm sm:text-base"
                  >
                    <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Get Started Free
                  </Link>
                  <a
                    href="#features"
                    className="border-2 border-slate-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-slate-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center text-sm sm:text-base"
                  >
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer - Mobile Optimized */}
        <footer className="py-8 sm:py-12 border-t border-white/10 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center sm:text-left lg:col-span-1">
                <div className="flex items-center justify-center sm:justify-start mb-4">
                  <div className="bg-gradient-to-br from-gray-100 to-white rounded-full p-2 shadow-lg mr-2">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-slate-800" />
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-white">
                    Legal<span className="text-gray-300">Mentor</span>
                  </span>
                </div>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  AI-powered legal research assistant for Pakistan's legal professionals.
                </p>
              </div>

              <div className="text-center sm:text-left">
                <h4 className="text-white font-bold mb-4 text-sm sm:text-base">Quick Links</h4>
                <ul className="space-y-2">
                  {[
                    { name: "Features", href: "#features" },
                    { name: "Benefits", href: "#benefits" },
                    { name: "About", href: "#about" },
                    { name: "Contact", href: "#contact" },
                  ].map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center sm:text-left">
                <h4 className="text-white font-bold mb-4 text-sm sm:text-base">Legal Resources</h4>
                <ul className="space-y-2">
                  {["Case Law Database", "Legal Citations", "Pakistan Penal Code", "Constitution of Pakistan"].map(
                    (resource) => (
                      <li key={resource}>
                        <a
                          href="#"
                          className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors duration-200"
                        >
                          {resource}
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              <div className="text-center sm:text-left">
                <h4 className="text-white font-bold mb-4 text-sm sm:text-base">Contact</h4>
                <ul className="space-y-2">
                  <li className="text-sm sm:text-base text-gray-400">University of Management and Technology</li>
                  <li className="text-sm sm:text-base text-gray-400">C-II Johar Town, Lahore</li>
                  <li className="text-sm sm:text-base text-gray-400">Pakistan</li>
                  <li>
                    <a
                      href="mailto:info@legalmentor.pk"
                      className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      info@legalmentor.pk
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm sm:text-base text-gray-400 text-center md:text-left">
                &copy; {new Date().getFullYear()} LegalMentor. All rights reserved.
              </p>
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
                <a
                  href="#"
                  className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default LandingPage
