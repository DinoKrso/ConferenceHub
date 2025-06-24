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
import { ArrowLeft, X } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { uploadToImgbb, validateImageFile } from "@/lib/imgbb"
import { SpeakerSelector } from "@/components/speaker-selector"

interface Conference {
  _id: string
  title: string
  description: string
  category: {
    _id: string
    name: string
  }
  hashTags: string[]
  startDate: string
  endDate: string
  location: string
  ticketPrice: number
  currency: string
  maxAttendees: number
  speakersID: string[]
  image: string
}

interface EditConferencePageProps {
  params: {
    id: string
  }
}

export default function EditConferencePage({ params }: EditConferencePageProps) {
  const [conference, setConference] = useState<Conference | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [location, setLocation] = useState("")
  const [ticketPrice, setTicketPrice] = useState<string>("0")
  const [currency, setCurrency] = useState("USD")
  const [maxAttendees, setMaxAttendees] = useState<string>("100")
  const [selectedSpeakers, setSelectedSpeakers] = useState<string[]>([])
  const [speakers, setSpeakers] = useState<Array<{ _id: string; name: string; surname: string }>>([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState("")
  const { session, isUser } = useAuth()
  const router = useRouter()
  const [bannerImage, setBannerImage] = useState<string>("")
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (!session || !isUser) {
      router.push("/login")
      return
    }

    const fetchConference = async () => {
      try {
        const response = await fetch(`/api/conferences/${params.id}`)
        const data = await response.json()

        if (data.success) {
          const conf = data.data
          setConference(conf)
          setTitle(conf.title)
          setDescription(conf.description)
          setCategory(conf.category.name)
          setHashtags(conf.hashTags || [])
          setStartDate(new Date(conf.startDate))
          setEndDate(new Date(conf.endDate))
          setLocation(conf.location)
          setTicketPrice(String(conf.ticketPrice || 0))
          setCurrency(conf.currency || "USD")
          setMaxAttendees(String(conf.maxAttendees || 100))
          setSelectedSpeakers(conf.speakersID || [])
          setBannerImage(conf.image || "")
        } else {
          setError("Conference not found")
        }
      } catch (error) {
        console.error("Error fetching conference:", error)
        setError("Failed to load conference")
      } finally {
        setFetchLoading(false)
      }
    }

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

    fetchConference()
    fetchSpeakers()
  }, [params.id, session, isUser, router])

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
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setTicketPrice(value)
    }
  }

  const handleMaxAttendeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d+$/.test(value)) {
      setMaxAttendees(value)
    }
  }

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.isValid) {
      setError(validation.error || "Invalid file")
      return
    }

    try {
      setUploadingImage(true)
      setError("")

      const imageUrl = await uploadToImgbb(file)
      setBannerImage(imageUrl)
    } catch (error) {
      console.error("Error uploading banner:", error)
      setError(error instanceof Error ? error.message : "Failed to upload banner image")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description || !category || !startDate || !endDate || !location) {
      setError("Please fill in all required fields")
      return
    }

    if (endDate < startDate) {
      setError("End date cannot be before start date")
      return
    }

    try {
      setLoading(true)
      setError("")

      const priceValue = Number.parseFloat(ticketPrice) || 0
      const maxAttendeesValue = Number.parseInt(maxAttendees) || 100

      const response = await fetch(`/api/conferences/${params.id}`, {
        method: "PUT",
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
          location,
          ticketPrice: priceValue,
          currency,
          maxAttendees: maxAttendeesValue,
          speakersID: selectedSpeakers,
          image: bannerImage, // Add this line
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update conference")
      }

      router.push(`/conferences/${params.id}`)
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

  if (fetchLoading) {
    return <div className="container mx-auto px-4 py-8">Loading conference...</div>
  }

  if (!conference) {
    return <div className="container mx-auto px-4 py-8">Conference not found</div>
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
          <h1 className="text-3xl font-bold">Edit Conference</h1>
          <p className="text-muted-foreground">Update your conference details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Conference</CardTitle>
          <CardDescription>Make changes to your conference details</CardDescription>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <Input
                id="location"
                placeholder="Enter venue name and city"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
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
                    min="0"
                    step="0.01"
                    value={ticketPrice}
                    onChange={handleTicketPriceChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                <Input
                  id="maxAttendees"
                  type="text"
                  placeholder="100"
                  min="1"
                  value={maxAttendees}
                  onChange={handleMaxAttendeesChange}
                  required
                />
              </div>
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
              </div>
            </div>

            <SpeakerSelector
              speakers={speakers}
              selectedSpeakers={selectedSpeakers}
              onSpeakersChange={setSelectedSpeakers}
              onSpeakersListUpdate={setSpeakers}
            />

            <div className="space-y-2">
              <Label>Conference Banner</Label>
              {bannerImage ? (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={bannerImage || "/placeholder.svg"}
                      alt="Conference banner"
                      className="h-48 w-full object-cover"
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
                    onClick={() => document.getElementById("banner-upload-edit")?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? "Uploading..." : "Change Banner"}
                  </Button>
                </div>
              ) : (
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed p-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("banner-upload-edit")?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? "Uploading..." : "Upload Banner"}
                  </Button>
                </div>
              )}
              <input
                id="banner-upload-edit"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
                disabled={uploadingImage}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating Conference..." : "Update Conference"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
