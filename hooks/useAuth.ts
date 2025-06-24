"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import type { Session } from "next-auth"

interface AuthContextType {
  session: Session | null
  isUser: boolean
  isGuest: boolean
  login: (email: string, password: string) => Promise<any>
  register: (name: string, email: string, password: string, role: string, captchaToken?: string) => Promise<any>
  logout: () => void
}

export const useAuth = (): AuthContextType => {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isUser = session?.user?.role === "user"
  const isGuest = session?.user?.role === "guest"

  const login = async (email: string, password: string) => {
    const result = await signIn("user-login", {
      email,
      password,
      redirect: false,
    })
    return result
  }

  const register = async (name: string, email: string, password: string, role: string, captchaToken?: string) => {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, role, captchaToken }),
    })
    return response.json()
  }

  const logout = () => {
    signOut({ callbackUrl: "/" })
  }

  return {
    session,
    isUser,
    isGuest,
    login,
    register,
    logout,
  }
}
