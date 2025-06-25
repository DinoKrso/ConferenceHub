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
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, CheckCircle, Clock, User } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { uploadToImgbb, validateImageFile } from "@/lib/imgbb"
import { SpeakerSelector } from "@/components/speaker-selector"
import PaymentModal from "@/components/payment-modal"
import RegistrationConfirmationModal from "@/components/registration-confirmation-modal"

interface Conference {
  _id: string
  title: string
  description: string
  category: {
    _id: string
    name: string
  }
  hashTags: string[]
  attendees: number
  startDate: string
  endDate: string
  location: string
  image: string
  ticketPrice: number
  currency: string
  maxAttendees: number
  speakersID?: Array<{
    _id: string
    name: string
    surname: string
    bio: string
    profileImage: string
  }>
  createdBy?: {
    _id: string
    name: string
    email: string
  }
}

interface ConferenceDetailsPageProps {
  params: {
    id: string
  }
}

export default function ConferenceDetailsPage({ params }: ConferenceDetailsPageProps) {
  const [conference, setConference] = useState<Conference | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isRegistered, setIsRegistered] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const { session, isGuest, isUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchConference = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/conferences/${params.id}`)
        const data = await response.json()

        if (data.success) {
          setConference(data.data)
        } else {
          setError("Conference not found")
        }
      } catch (error) {
        console.error("Error fetching conference:", error)
        setError("Failed to load conference")
      } finally {
        setLoading(false)
      }
    }

    const checkRegistrationStatus = async () => {
      if (!session || !isGuest) return

      try {
        const response = await fetch(`/api/enrollment/check/${params.id}`)
        const data = await response.json()
        setIsRegistered(data.success && data.isRegistered)
      } catch (error) {
        console.error("Error checking registration status:", error)
      }
    }

    fetchConference()
    checkRegistrationStatus()
  }, [params.id, session, isGuest])

  const handleRegister = async () => {
    if (!session) {
      router.push("/login")
      return
    }

    if (!isGuest) {
      alert("Only attendees can register for conferences")
      return
    }

    // If the conference is free, show confirmation modal
    if (conference?.ticketPrice === 0) {
      setShowConfirmationModal(true)
    } else {
      // Show payment modal for paid conferences
      setShowPaymentModal(true)
    }
  }

  const handleFreeRegistration = async () => {
    if (!conference) return

    try {
      setEnrolling(true)

      const response = await fetch("/api/enrollment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conferenceID: conference._id }),
      })

      const data = await response.json()

      if (data.success) {
        setIsRegistered(true)
        setConference(prev => prev ? { ...prev, attendees: prev.attendees + 1 } : null)
        alert("Successfully registered for the conference!")
        setShowConfirmationModal(false)
      } else {
        alert(data.message || "Failed to register for the conference")
      }
    } catch (error) {
      console.error("Error registering for conference:", error)
      alert("An error occurred while registering for the conference")
    } finally {
      setEnrolling(false)
    }
  }

  const handlePaymentSuccess = () => {
    setIsRegistered(true)
    setConference(prev => prev ? { ...prev, attendees: prev.attendees + 1 } : null)
    setShowPaymentModal(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return "Free"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading conference details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !conference) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Conference Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || "The conference you're looking for doesn't exist."}</p>
          <Button asChild>
            <Link href="/conferences">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Conferences
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button asChild variant="ghost">
          <Link href="/conferences">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Conferences
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Conference Banner */}
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img
              src={conference.image || "/placeholder.jpg"}
              alt={conference.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <Badge variant="secondary" className="mb-2">
                {conference.category.name}
              </Badge>
              <h1 className="text-3xl font-bold text-white">{conference.title}</h1>
            </div>
          </div>

          {/* Conference Details */}
          <Card>
            <CardHeader>
              <CardTitle>About This Conference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">{conference.description}</p>
              
              {/* Event Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(conference.startDate)} - {formatDate(conference.endDate)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(conference.startDate)} - {formatTime(conference.endDate)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{conference.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Attendees</p>
                    <p className="text-sm text-muted-foreground">
                      {conference.attendees} / {conference.maxAttendees}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Ticket Price</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(conference.ticketPrice, conference.currency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hashtags */}
              {conference.hashTags && conference.hashTags.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {conference.hashTags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Speakers */}
          {conference.speakersID && conference.speakersID.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Speakers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {conference.speakersID.map((speaker) => (
                    <div key={speaker._id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                        <img
                          src={speaker.profileImage || "/placeholder-user.jpg"}
                          alt={`${speaker.name} ${speaker.surname}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{speaker.name} {speaker.surname}</p>
                        {speaker.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{speaker.bio}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organizer Info */}
          {conference.createdBy && (
            <Card>
              <CardHeader>
                <CardTitle>Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{conference.createdBy.name}</p>
                    <p className="text-sm text-muted-foreground">{conference.createdBy.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card>
            <CardHeader>
              <CardTitle>Registration</CardTitle>
              <CardDescription>
                {conference.attendees >= conference.maxAttendees 
                  ? "This conference is full" 
                  : `${conference.maxAttendees - conference.attendees} spots remaining`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {formatPrice(conference.ticketPrice, conference.currency)}
                </div>
                {conference.ticketPrice === 0 && (
                  <Badge variant="secondary">Free Event</Badge>
                )}
              </div>

              {isRegistered ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    You are registered for this conference!
                  </AlertDescription>
                </Alert>
              ) : conference.attendees >= conference.maxAttendees ? (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    This conference is at full capacity.
                  </AlertDescription>
                </Alert>
              ) : (
                <Button 
                  onClick={handleRegister} 
                  className="w-full"
                  disabled={enrolling}
                >
                  {enrolling ? "Processing..." : "Register Now"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{conference.category.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">
                  {Math.ceil((new Date(conference.endDate).getTime() - new Date(conference.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-medium">{conference.maxAttendees} people</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Registration Confirmation Modal for Free Events */}
      {conference.ticketPrice === 0 && (
        <RegistrationConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          conference={conference}
          onConfirm={handleFreeRegistration}
          loading={enrolling}
        />
      )}

      {/* Payment Modal */}
      {conference.ticketPrice > 0 && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          conference={conference}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
