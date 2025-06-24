"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "lucide-react"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center justify-center gap-2">
            <Calendar className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold">Conference Hub</span>
          </Link>
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-muted-foreground">We'll send you a link to reset your password</p>
        </div>

        <Card className="backdrop-blur-sm bg-background/70">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Forgot Password</CardTitle>
                <CardDescription>Enter your email address to receive a reset link</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="name@example.com" required />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full">
                  Send Reset Link
                </Button>
                <div className="text-center text-sm">
                  Remember your password?{" "}
                  <Link href="/login" className="font-medium text-purple-600 hover:underline">
                    Back to login
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Check your email</h3>
              <p className="mb-4 text-muted-foreground">
                We've sent a password reset link to your email address. Please check your inbox.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Back to login</Link>
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
