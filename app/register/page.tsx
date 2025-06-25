"use client"

import Link from "next/link"

import type React from "react"

import { useState, useEffect, useRef } from "react"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useAuth } from "@/hooks/useAuth"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Eye, EyeOff, Info } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import HCaptcha from "@hcaptcha/react-hcaptcha"

export default function RegisterPage() {
  // All hooks must be called first, before any conditional logic
  const { data: session, status } = useSession()
  const router = useRouter()
  const { register: registerUser, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "guest",
    phoneNumber: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const hcaptchaRef = useRef<any>(null)

  // useEffect for redirect logic
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/conferences")
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      return
    }
    if (!captchaToken) {
      return
    }
    const success = await registerUser(formData.name, formData.email, formData.password, formData.role, captchaToken)
    if (!success) {
      // Reset hCaptcha on failure
      hcaptchaRef.current?.resetCaptcha()
      setCaptchaToken(null)
    } else {
      // Show animation/message and redirect to login after delay
      setRegistrationSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Show loading spinner while checking auth status or if authenticated
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Show registration success animation/message
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="w-20 h-20 text-green-500 animate-bounce mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="text-2xl font-bold mb-2 text-green-600">Registration Successful!</h2>
          <p className="text-muted-foreground mb-4">Redirecting you to the login page...</p>
        </div>
      </div>
    )
  }

  // Only show register form if not authenticated
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center justify-center gap-2">
            <Calendar className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold">Conference Hub</span>
          </Link>
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-muted-foreground">Sign up to get started with Conference Hub</p>
        </div>

        <Card className="backdrop-blur-sm bg-background/70">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Enter your information to create an account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  name="name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  name="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Account Type</Label>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Choose your account type carefully. You won't need to select this again when signing in.
                  </AlertDescription>
                </Alert>
                <RadioGroup
                  defaultValue="user"
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="user" id="user" />
                    <Label htmlFor="user" className="font-normal">
                      Conference Organizer - Create and manage conferences
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="guest" id="guest" />
                    <Label htmlFor="guest" className="font-normal">
                      Conference Attendee - Browse and register for conferences
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.role === "guest" && (
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="(123) 456-7890"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    name="phoneNumber"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    name="password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  name="confirmPassword"
                  required
                />
                {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Security Verification</Label>
                <HCaptcha
                  ref={hcaptchaRef}
                  sitekey="20cc822a-9766-41ac-981a-1622e85c95be"
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => setCaptchaToken(null)}
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  className="mt-1"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  required
                />
                <Label htmlFor="terms" className="text-sm font-normal">
                  I agree to the{" "}
                  <Link href="/terms" className="text-purple-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-purple-600 hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !agreedToTerms || formData.password !== formData.confirmPassword || !captchaToken}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-purple-600 hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
