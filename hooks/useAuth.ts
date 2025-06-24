"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function useAuth() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
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

      // Redirect based on user role after successful login
      // The role will be automatically detected by the auth system
      router.push("/")
      return true
    } catch (err) {
      setError("An unexpected error occurred")
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: {
    name: string
    email: string
    password: string
    role: string
    phoneNumber?: string
    captchaToken?: string
  }) => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Registration failed")
        return false
      }

      // Auto login after successful registration
      return await login(userData.email, userData.password)
    } catch (err) {
      setError("An unexpected error occurred")
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" })
  }

  return {
    session,
    status,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isUser: session?.user?.role === "user",
    isGuest: session?.user?.role === "guest",
  }
}
