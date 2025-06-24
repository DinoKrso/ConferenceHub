"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Edit, Save, X, User, Mail, Phone, Calendar, MapPin, Award } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { uploadToImgbb, validateImageFile } from "@/lib/imgbb"

interface UserProfile {
  _id: string
  name: string
  email: string
  role: string
  phoneNumber?: string
  profileImage?: string
  bio?: string
  location?: string
  website?: string
  company?: string
  jobTitle?: string
  createdAt: string
  conferenceCount?: number
  attendedConferences?: number
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { session, isUser, isGuest } = useAuth()
  const router = useRouter()

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    bio: "",
    location: "",
    website: "",
    company: "",
    jobTitle: "",
  })

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile")
        const data = await response.json()

        if (data.success) {
          setProfile(data.data)
          setFormData({
            name: data.data.name || "",
            phoneNumber: data.data.phoneNumber || "",
            bio: data.data.bio || "",
            location: data.data.location || "",
            website: data.data.website || "",
            company: data.data.company || "",
            jobTitle: data.data.jobTitle || "",
          })
        } else {
          setError("Failed to load profile")
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setProfile(data.data)
        setEditing(false)
        setSuccess("Profile updated successfully!")
      } else {
        setError(data.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phoneNumber: profile.phoneNumber || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        company: profile.company || "",
        jobTitle: profile.jobTitle || "",
      })
    }
    setEditing(false)
    setError("")
    setSuccess("")
  }

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      setError(validation.error || "Invalid file")
      return
    }

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      // Upload to ImgBB
      const imageUrl = await uploadToImgbb(file)

      // Update profile with new image URL
      const response = await fetch("/api/profile/image", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileImage: imageUrl }),
      })

      const data = await response.json()

      if (data.success) {
        setProfile((prev) => (prev ? { ...prev, profileImage: imageUrl } : null))
        setSuccess("Profile picture updated successfully!")
      } else {
        setError(data.message || "Failed to update profile picture")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      setError(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getRoleLabel = () => {
    if (isUser) return "Conference Organizer"
    if (isGuest) return "Conference Attendee"
    return "User"
  }

  const getRoleColor = () => {
    if (isUser) return "bg-purple-100 text-purple-800"
    if (isGuest) return "bg-blue-100 text-blue-800"
    return "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading profile...</div>
  }

  if (!profile) {
    return <div className="container mx-auto px-4 py-8">Profile not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Picture and Basic Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="relative mx-auto mb-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile.profileImage || "/placeholder-profile.svg"} alt={profile.name} />
                  <AvatarFallback className="text-2xl">{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0">
                  <label htmlFor="profile-image" className="cursor-pointer">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                      <Camera className="h-4 w-4" />
                    </div>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileImageUpload}
                      disabled={saving}
                    />
                  </label>
                </div>
              </div>
              <CardTitle className="text-xl">{profile.name}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
              <Badge className={`w-fit mx-auto ${getRoleColor()}`}>{getRoleLabel()}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(profile.createdAt)}</span>
              </div>

              {isUser && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span>{profile.conferenceCount || 0} conferences created</span>
                </div>
              )}

              {isGuest && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span>{profile.attendedConferences || 0} conferences attended</span>
                </div>
              )}

              {profile.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="professional">Professional Details</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Your basic personal details</CardDescription>
                  </div>
                  {!editing ? (
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      {editing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2 bg-muted">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.email}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      {editing ? (
                        <Input
                          id="phone"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                          placeholder="(123) 456-7890"
                        />
                      ) : (
                        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.phoneNumber || "Not provided"}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      {editing ? (
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          placeholder="City, Country"
                        />
                      ) : (
                        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.location || "Not provided"}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    {editing ? (
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        placeholder="Tell us about yourself..."
                        className="min-h-24"
                      />
                    ) : (
                      <div className="rounded-md border px-3 py-2 min-h-24">
                        <span>{profile.bio || "No bio provided"}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Professional Details</CardTitle>
                    <CardDescription>Your work and professional information</CardDescription>
                  </div>
                  {!editing ? (
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      {editing ? (
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange("company", e.target.value)}
                          placeholder="Your company name"
                        />
                      ) : (
                        <div className="rounded-md border px-3 py-2">
                          <span>{profile.company || "Not provided"}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      {editing ? (
                        <Input
                          id="jobTitle"
                          value={formData.jobTitle}
                          onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                          placeholder="Your job title"
                        />
                      ) : (
                        <div className="rounded-md border px-3 py-2">
                          <span>{profile.jobTitle || "Not provided"}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    {editing ? (
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        placeholder="https://yourwebsite.com"
                      />
                    ) : (
                      <div className="rounded-md border px-3 py-2">
                        {profile.website ? (
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {profile.website}
                          </a>
                        ) : (
                          <span>Not provided</span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
