"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  accountType: "lawyer" | "client" | "admin"
  barNumber?: string
  specialization?: string
  yearsOfExperience?: number
  phone?: string
  address?: string
  isEmailVerified?: boolean
  twoFactorEnabled?: boolean
  createdAt: string
  updatedAt?: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  accountType: "lawyer" | "client"
  barNumber?: string
  specialization?: string
  yearsOfExperience?: number
  phone?: string
  address?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<{ success: boolean; error?: string; requiresTwoFactor?: boolean }>
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (updates: Partial<User>) => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  verifyEmail: (token: string) => Promise<boolean>
  refreshSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}

const API_BASE_URL = "http://localhost:8000" // Change for production

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const userData = localStorage.getItem("currentUser")

      if (token && userData) {
        const parsedUser = JSON.parse(userData)
        // Attempt to fetch fresh user data to validate token and get latest info
        const res = await fetch(`${API_BASE_URL}/api/auth/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("Token invalid or expired")

        const freshUserData = await res.json()
        const transformedUser: User = {
          id: freshUserData.user_id.toString(),
          name: freshUserData.full_name || freshUserData.name,
          email: freshUserData.email,
          accountType: freshUserData.user_type || "client",
          phone: freshUserData.phone_number,
          barNumber: freshUserData.bar_number,
          specialization: freshUserData.specialization,
          yearsOfExperience: freshUserData.years_of_experience,
          address: freshUserData.address,
          isEmailVerified: true, // Assuming verified if token is valid
          twoFactorEnabled: false,
          createdAt: freshUserData.created_at || new Date().toISOString(),
          updatedAt: freshUserData.updated_at || new Date().toISOString(),
        }
        setUser(transformedUser)
        localStorage.setItem("currentUser", JSON.stringify(transformedUser)) // Update local storage with fresh data
      } else {
        // No token or user data - this is normal for unauthenticated users
        setUser(null)
        return
      }
    } catch (error) {
      console.error("Auth initialization error:", error)
      localStorage.removeItem("authToken")
      localStorage.removeItem("currentUser")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (
    email: string,
    password: string,
    rememberMe = false,
  ): Promise<{ success: boolean; error?: string; requiresTwoFactor?: boolean }> => {
    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("username", email)
      formData.append("password", password)

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        console.log("Backend response data:", data)
        console.log("User data from backend:", data.user)
        console.log("Account type from backend:", data.user.accountType)
        console.log("User type from backend:", data.user.user_type)
        
        const transformedUser: User = {
          id: data.user.user_id.toString(),
          name: data.user.full_name || data.user.name,
          email: data.user.email,
          accountType: data.user.accountType || data.user.user_type || "client",
          phone: data.user.phone_number,
          barNumber: data.user.bar_number,
          specialization: data.user.specialization,
          yearsOfExperience: data.user.years_of_experience,
          address: data.user.address,
          isEmailVerified: true,
          twoFactorEnabled: false,
          createdAt: data.user.created_at || new Date().toISOString(),
          updatedAt: data.user.updated_at || new Date().toISOString(),
        }

        console.log("Transformed user:", transformedUser)
        console.log("Final account type:", transformedUser.accountType)

        setUser(transformedUser)
        localStorage.setItem("authToken", data.access_token)
        localStorage.setItem("currentUser", JSON.stringify(transformedUser))

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true")
        }

        return { success: true }
      }

      return { success: false, error: typeof data.detail === 'string' ? data.detail : "Invalid credentials" }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Network error" }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)

      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      const data = await res.json()

      if (res.ok) {
        const transformedUser: User = {
          id: data.user.user_id.toString(),
          name: data.user.full_name || data.user.name,
          email: data.user.email,
          accountType: data.user.accountType || data.user.user_type || "client",
          phone: data.user.phone_number,
          barNumber: data.user.bar_number,
          specialization: data.user.specialization,
          yearsOfExperience: data.user.years_of_experience,
          address: data.user.address,
          isEmailVerified: false,
          twoFactorEnabled: false,
          createdAt: data.user.created_at || new Date().toISOString(),
          updatedAt: data.user.updated_at || new Date().toISOString(),
        }

        setUser(transformedUser)
        localStorage.setItem("authToken", data.access_token)
        localStorage.setItem("currentUser", JSON.stringify(transformedUser))

        // Redirect based on user role after successful registration
        switch (transformedUser.accountType) {
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
        return { success: true }
      }

      return { success: false, error: typeof data.detail === 'string' ? data.detail : "Registration failed" }
    } catch (error) {
      console.error("Register error:", error)
      return { success: false, error: "Network error" }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("authToken")
    localStorage.removeItem("currentUser")
    localStorage.removeItem("rememberMe")
    router.push("/")
  }

  const updateUser = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false

      const token = localStorage.getItem("authToken")
      if (!token) return false

      // Use the settings endpoint instead of the non-existent auth endpoint
      const res = await fetch(`${API_BASE_URL}/api/settings/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          address: updates.address,
          specialization: updates.specialization,
          barNumber: updates.barNumber,
          yearsOfExperience: updates.yearsOfExperience,
        }),
      })

      if (res.ok) {
        const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() }
        setUser(updatedUser)
        localStorage.setItem("currentUser", JSON.stringify(updatedUser))
        return true
      }

      return false
    } catch (error) {
      console.error("Update error:", error)
      return false
    }
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      return res.ok
    } catch (error) {
      console.error("Reset password error:", error)
      return false
    }
  }

  const changePassword = async (_current: string, _new: string): Promise<boolean> => {
    // Placeholder - implement on backend
    return true
  }

  const verifyEmail = async (_token: string): Promise<boolean> => {
    if (user) {
      const updatedUser = { ...user, isEmailVerified: true }
      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    }
    return true
  }

  const refreshSession = async (): Promise<boolean> => {
    return true // Implement token refresh if needed
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
        resetPassword,
        changePassword,
        verifyEmail,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
