"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Session } from "next-auth"

interface AuthContextType {
  session: Session | null
  loading: boolean
  error: string
  isUser: boolean
  isGuest: boolean
  login: (email: string, password: string) => Promise<any>
  register: (name: string, email: string, password: string, role: string, captchaToken?: string) => Promise<any>
  logout: () => void
}

export const useAuth = (): AuthContextType => {
  const { data: session, status } = useSession()
  const [error, setError] = useState("")
  const router = useRouter()

  const loading = status === "loading"
  const isUser = session?.user?.role === "user"
  const isGuest = session?.user?.role === "guest"

  const login = async (email: string, password: string) => {
    try {
      setError("")
      const result = await signIn("user-login", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        return false
      }

      return true
    } catch (err) {
      setError("An unexpected error occurred")
      return false
    }
  }

  const register = async (name: string, email: string, password: string, role: string, captchaToken?: string) => {
    try {
      setError("")
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role, captchaToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Registration failed")
        return false
      }

      return true
    } catch (err) {
      setError("An unexpected error occurred")
      return false
    }
  }

  const logout = () => {
    signOut({ callbackUrl: "/" })
  }

  return {
    session,
    loading,
    error,
    isUser,
    isGuest,
    login,
    register,
    logout,
  }
}
