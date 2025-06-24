"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Check, ImageIcon, Info, MapPin, Upload, X } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { uploadToImgbb, validateImageFile } from "@/lib/imgbb"
import { SpeakerSelector } from "@/components/speaker-selector"

export default function CreateConferencePage() {
  const [activeTab, setActiveTab] = useState("basic")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("IT")
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [venueLocation, setVenueLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { session, isUser } = useAuth()
  const router = useRouter()
  const [selectedSpeakers, setSelectedSpeakers] = useState<string[]>([])
  const [speakers, setSpeakers] = useState<Array<{ _id: string; name: string; surname: string }>>([])
  const [ticketPrice, setTicketPrice] = useState<string>("0") // Changed to string for better input handling
  const [currency, setCurrency] = useState("USD")
  const [maxAttendees, setMaxAttendees] = useState<string>("100") // Changed to string for better input handling
  const [bannerImage, setBannerImage] = useState<string>("")
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        const response = await fetch("/api/speakers")
        const data = await response.json()

        if (data.success) {
          setSpeakers(data.data)
        }
      } catch (error) {
        console.error("Error fetching speakers:", error)
      }
    }

    fetchSpeakers()
  }, [])

  // Redirect if not logged in or not a conference organizer
  if (!session || !isUser) {
    router.push("/login")
    return null
  }

  const addHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
      setHashtags([...hashtags, hashtagInput.trim()])
      setHashtagInput("")
    }
  }

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag))
  }

  const handleHashtagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addHashtag()
    }
  }

  const handleTicketPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow empty string, numbers, and decimal points
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setTicketPrice(value)
    }
  }

  const handleMaxAttendeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow empty string and positive integers only
    if (value === "" || /^\d+$/.test(value)) {
      setMaxAttendees(value)
    }
  }

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      setError(validation.error || "Invalid file")
      return
    }

    try {
      setUploadingImage(true)
      setError("")

      // Upload to ImgBB
      const imageUrl = await uploadToImgbb(file)
      setBannerImage(imageUrl)
      setError("")
    } catch (error) {
      console.error("Error uploading banner:", error)
      setError(error instanceof Error ? error.message : "Failed to upload banner image")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description || !category || !startDate || !endDate || !venueLocation) {
      setError("Please fill in all required fields")
      return
    }

    if (endDate < startDate) {
      setError("End date cannot be before start date")
      return
    }

    // Validate numeric fields
    const priceValue = Number.parseFloat(ticketPrice) || 0
    const maxAttendeesValue = Number.parseInt(maxAttendees) || 100

    if (priceValue < 0) {
      setError("Ticket price cannot be negative")
      return
    }

    if (maxAttendeesValue < 1) {
      setError("Maximum attendees must be at least 1")
      return
    }

    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/conferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
          hashTags: hashtags,
          startDate,
          endDate,
          location: venueLocation,
          speakersID: selectedSpeakers,
          ticketPrice: priceValue,
          currency,
          maxAttendees: maxAttendeesValue,
          image: bannerImage, // Add this line
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create conference")
      }

      router.push(`/conferences/${data.data._id}`)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Conference</h1>
          <p className="text-muted-foreground">Add a new conference to the platform</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conference Creation</CardTitle>
              <CardDescription>Complete all sections to create your conference</CardDescription>
            </CardHeader>
            <CardContent>
              <nav className="flex flex-col space-y-1">
                <Button
                  variant={activeTab === "basic" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("basic")}
                >
                  <Info className="mr-2 h-4 w-4" />
                  Basic Information
                </Button>
                <Button
                  variant={activeTab === "details" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("details")}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Date & Location
                </Button>
                <Button
                  variant={activeTab === "media" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("media")}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Media & Branding
                </Button>
              </nav>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completion Status</CardTitle>
              <CardDescription>Track your progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${
                      title && description && category
                        ? "bg-green-100 text-green-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {title && description && category ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span className="text-xs">1</span>
                    )}
                  </div>
                  <span className="text-sm">Basic Information</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${
                      startDate && endDate && venueLocation && ticketPrice !== "" && maxAttendees !== ""
                        ? "bg-green-100 text-green-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {startDate && endDate && venueLocation && ticketPrice !== "" && maxAttendees !== "" ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span className="text-xs">2</span>
                    )}
                  </div>
                  <span className="text-sm">Date & Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <span className="text-xs">3</span>
                  </div>
                  <span className="text-sm">Media & Branding</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Create Your Conference</CardTitle>
                <CardDescription>Fill out the details below to create a new conference</CardDescription>
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="hidden">
                    <TabsTrigger value="basic">Basic Information</TabsTrigger>
                    <TabsTrigger value="details">Date & Location</TabsTrigger>
                    <TabsTrigger value="media">Media & Branding</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Conference Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter conference name"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IT">IT</SelectItem>
                          <SelectItem value="Security">Security</SelectItem>
                          <SelectItem value="Programming">Programming</SelectItem>
                          <SelectItem value="Data Science">Data Science</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter conference description"
                        className="min-h-32"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hashtags">Hashtags</Label>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Input
                            id="hashtags"
                            placeholder="Add hashtags (press Enter or comma to add)"
                            value={hashtagInput}
                            onChange={(e) => setHashtagInput(e.target.value)}
                            onKeyDown={handleHashtagKeyDown}
                          />
                          <Button type="button" onClick={addHashtag}>
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {hashtags.map((tag) => (
                            <Badge key={tag} className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                              #{tag} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeHashtag(tag)} />
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Add relevant hashtags to help attendees find your conference. Popular hashtags: #tech, #ai,
                          #webdev, #security
                        </p>
                      </div>
                    </div>
                    <SpeakerSelector
                      speakers={speakers}
                      selectedSpeakers={selectedSpeakers}
                      onSpeakersChange={setSelectedSpeakers}
                      onSpeakersListUpdate={setSpeakers}
                    />
                    <div className="flex justify-end">
                      <Button type="button" onClick={() => setActiveTab("details")}>
                        Next: Date & Location
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <DatePicker date={startDate} setDate={setStartDate} />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <DatePicker date={endDate} setDate={setEndDate} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          placeholder="Enter venue name and city (e.g., Convention Center, New York)"
                          value={venueLocation}
                          onChange={(e) => setVenueLocation(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ticketPrice">Ticket Price</Label>
                      <div className="flex gap-2">
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="CAD">CAD</SelectItem>
                            <SelectItem value="AUD">AUD</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          id="ticketPrice"
                          type="text"
                          placeholder="0.00"
                          value={ticketPrice}
                          onChange={handleTicketPriceChange}
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Set to 0 for free events. Current price: {ticketPrice ? `${currency} ${ticketPrice}` : "Free"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                      <Input
                        id="maxAttendees"
                        type="text"
                        placeholder="100"
                        value={maxAttendees}
                        onChange={handleMaxAttendeesChange}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum number of people who can register for this conference
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                        Previous
                      </Button>
                      <Button type="button" onClick={() => setActiveTab("media")}>
                        Next: Media & Branding
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="media" className="space-y-6">
                    <div className="space-y-2">
                      <Label>Conference Banner</Label>
                      {bannerImage ? (
                        <div className="space-y-4">
                          <div className="relative overflow-hidden rounded-lg">
                            <img
                              src={bannerImage || "/placeholder.svg"}
                              alt="Conference banner"
                              className="h-64 w-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => setBannerImage("")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("banner-upload")?.click()}
                            disabled={uploadingImage}
                          >
                            {uploadingImage ? "Uploading..." : "Change Banner"}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-12">
                          <div className="flex flex-col items-center justify-center space-y-2 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                              <Upload className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {uploadingImage ? "Uploading banner..." : "Upload your banner image"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Recommended size: 1200 x 600 pixels (16:9 ratio)
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById("banner-upload")?.click()}
                              disabled={uploadingImage}
                            >
                              {uploadingImage ? "Uploading..." : "Browse Files"}
                            </Button>
                          </div>
                        </div>
                      )}
                      <input
                        id="banner-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBannerUpload}
                        disabled={uploadingImage}
                      />
                      <p className="text-xs text-muted-foreground">
                        Supported formats: JPEG, PNG, GIF, WebP. Maximum size: 32MB.
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                        Previous
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Creating Conference..." : "Create Conference"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
