"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Share2, Users, DollarSign, CheckCircle } from "lucide-react"
import SpeakerCard from "@/components/speaker-card"
import PaymentModal from "@/components/payment-modal"
import RegistrationConfirmationModal from "@/components/registration-confirmation-modal"
import type { Conference } from "@/types/conference"

interface ConferencePageProps {
  params: {
    id: string
  }
}

export default function ConferencePage({ params }: ConferencePageProps) {
  const [conference, setConference] = useState<Conference | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [checkingRegistration, setCheckingRegistration] = useState(false)
  const { session, isGuest } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchConference = async () => {
      try {
        console.log("Fetching conference:", params.id)
        const response = await fetch(`/api/conferences/${params.id}`)
        const data = await response.json()

        if (data.success) {
          setConference(data.data)
          console.log("Conference loaded:", data.data.title)
        } else {
          console.error("Conference not found")
        }
      } catch (error) {
        console.error("Error fetching conference:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchConference()
  }, [params.id])

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!session || !isGuest || !params.id) {
        console.log("Skipping registration check - no session, not guest, or no conference ID")
        return
      }

      try {
        setCheckingRegistration(true)
        console.log("Checking registration status for conference:", params.id)
        console.log("User ID:", session.user.id)

        const url = `/api/enrollment/check/${params.id}`
        console.log("API URL:", url)

        const response = await fetch(url)
        console.log("Response status:", response.status)
        console.log("Response headers:", response.headers.get("content-type"))

        // Check if response is JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.error("API returned non-JSON response")
          const text = await response.text()
          console.error("Response text:", text.substring(0, 200))
          return
        }

        const data = await response.json()
        console.log("Registration check response:", data)

        if (data.success) {
          setIsRegistered(data.isRegistered)
          console.log("Registration status:", data.isRegistered ? "REGISTERED" : "NOT REGISTERED")
        } else {
          console.error("Failed to check registration:", data.message)
          // Don't show error to user, just assume not registered
          setIsRegistered(false)
        }
      } catch (error) {
        console.error("Error checking registration status:", error)
        // On error, assume not registered to allow registration attempt
        setIsRegistered(false)
      } finally {
        setCheckingRegistration(false)
      }
    }

    // Only check registration after conference is loaded and user is authenticated
    if (conference && session && isGuest) {
      checkRegistrationStatus()
    }
  }, [session, isGuest, params.id, conference])

  // Handle PayPal success/error messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get("success")
    const error = urlParams.get("error")

    if (success === "payment_completed") {
      alert("Payment completed successfully! You are now registered for the conference.")
      setIsRegistered(true)
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname)
    } else if (error) {
      let errorMessage = "An error occurred during payment."
      if (error === "payment_failed") errorMessage = "Payment failed. Please try again."
      if (error === "payment_error") errorMessage = "Payment processing error. Please contact support."
      if (error === "missing_params") errorMessage = "Invalid payment parameters."

      alert(errorMessage)
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  const handleRegister = async () => {
    if (!session) {
      router.push("/login")
      return
    }

    if (!isGuest) {
      alert("Only attendees can register for conferences")
      return
    }

    if (!conference) return

    // If the conference is free, show confirmation modal
    if (conference.ticketPrice === 0) {
      setShowConfirmationModal(true)
    } else {
      // Show payment modal for paid conferences
      setShowPaymentModal(true)
    }
  }

  const handleFreeRegistration = async () => {
    if (!conference) return

    try {
      setRegistering(true)

      const response = await fetch("/api/enrollment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conferenceID: conference._id }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      if (!text) {
        throw new Error("Empty response from server")
      }

      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error("Failed to parse JSON:", text)
        throw new Error("Invalid JSON response from server")
      }

      if (data.success) {
        alert("Successfully registered for the conference!")
        setConference((prev) => (prev ? { ...prev, attendees: prev.attendees + 1 } : null))
        setIsRegistered(true)
        setShowConfirmationModal(false)
      } else {
        alert(data.message || "Failed to register for the conference")
      }
    } catch (error) {
      console.error("Error registering for conference:", error)
      alert(`An error occurred while registering: ${error.message}`)
    } finally {
      setRegistering(false)
    }
  }

  const handlePaymentSuccess = () => {
    setConference((prev) => (prev ? { ...prev, attendees: prev.attendees + 1 } : null))
    setIsRegistered(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
    return <div className="container mx-auto px-4 py-8">Loading conference...</div>
  }

  if (!conference) {
    return <div className="container mx-auto px-4 py-8">Conference not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant="outline">{conference.category.name}</Badge>
                <Badge variant="secondary">Upcoming</Badge>
                {isRegistered && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Registered
                  </Badge>
                )}
              </div>
              <h1 className="mb-2 text-3xl font-bold">{conference.title}</h1>
              {conference.hashTags && conference.hashTags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {conference.hashTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(conference.startDate)} - {formatDate(conference.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{conference.location}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <div className="mb-8 overflow-hidden rounded-lg">
            <img
              src={conference.image || `/placeholder.svg?height=400&width=800`}
              alt={conference.title}
              className="h-full w-full object-cover"
            />
          </div>

          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="speakers">Speakers</TabsTrigger>
              <TabsTrigger value="venue">Venue</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4 space-y-4">
              <div>
                <h2 className="mb-2 text-2xl font-bold">About This Conference</h2>
                <p className="text-muted-foreground">{conference.description}</p>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-bold">Conference Details</h3>
                <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
                  <li>
                    Duration: {formatDate(conference.startDate)} - {formatDate(conference.endDate)}
                  </li>
                  <li>Location: {conference.location}</li>
                  <li>Maximum Attendees: {conference.maxAttendees}</li>
                  <li>Current Registrations: {conference.attendees}</li>
                  <li>Organized by: {conference.createdBy.name}</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="speakers" className="mt-4">
              <h2 className="mb-4 text-2xl font-bold">Conference Speakers</h2>
              {conference.speakersID && conference.speakersID.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {conference.speakersID.map((speaker) => (
                    <SpeakerCard
                      key={speaker._id}
                      name={speaker.name}
                      surname={speaker.surname}
                      role={speaker.role || "Speaker"}
                      image={speaker.profileImage || "placeholder-profile.svg"}
                      bio={speaker.bio}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No speakers announced yet.</p>
              )}
            </TabsContent>
            <TabsContent value="venue" className="mt-4 space-y-4">
              <h2 className="mb-4 text-2xl font-bold">Venue Information</h2>

              {/* Google Maps Integration */}
              <div className="overflow-hidden rounded-lg border">
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dkmvnRAoKlNOKs&q=${encodeURIComponent(conference.location)}`}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                  title={`Map of ${conference.location}`}
                />
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">Location Details</h3>
                <p className="font-medium text-lg">{conference.location}</p>
                <p className="text-muted-foreground mt-2">
                  View the exact location and nearby amenities on the map above. You can zoom in/out and explore the
                  surrounding area.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-2">Getting There</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the map above to plan your route and find the best transportation options to the venue.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-2">Nearby Facilities</h4>
                  <p className="text-sm text-muted-foreground">
                    Explore restaurants, hotels, and parking options in the area using the interactive map.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-bold">Registration</h2>

            {checkingRegistration ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Checking registration status...</p>
              </div>
            ) : isRegistered ? (
              <div className="text-center">
                <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
                  <CheckCircle className="mx-auto mb-2 h-8 w-8" />
                  <h3 className="font-semibold">You're Already Registered!</h3>
                  <p className="text-sm">You have successfully registered for this conference.</p>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/my-conferences">View My Conferences</a>
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Ticket Price</span>
                    <span className="font-medium flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatPrice(conference.ticketPrice, conference.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Spots</span>
                    <span className="font-medium">
                      {conference.maxAttendees - conference.attendees} / {conference.maxAttendees}
                    </span>
                  </div>
                </div>

                <div className="mb-4 rounded-lg bg-muted p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(conference.ticketPrice, conference.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {conference.ticketPrice === 0 ? "Free Event" : "Per Ticket"}
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleRegister}
                  disabled={registering || conference.attendees >= conference.maxAttendees}
                >
                  {registering
                    ? "Registering..."
                    : conference.attendees >= conference.maxAttendees
                      ? "Sold Out"
                      : conference.ticketPrice === 0
                        ? "Register for Free"
                        : `Register - ${formatPrice(conference.ticketPrice, conference.currency)}`}
                </Button>

                {conference.ticketPrice > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground text-center">
                    Secure payment with credit card or PayPal
                  </div>
                )}
              </>
            )}
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-bold">Conference Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Date & Time</h3>
                <p className="font-medium">
                  {formatDate(conference.startDate)} - {formatDate(conference.endDate)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                <p className="font-medium">{conference.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Attendees</h3>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <p className="font-medium">{conference.attendees} registered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {conference && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          conference={conference}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
      {/* Registration Confirmation Modal for Free Events */}
      {conference && conference.ticketPrice === 0 && (
        <RegistrationConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          conference={conference}
          onConfirm={handleFreeRegistration}
          loading={registering}
        />
      )}
    </div>
  )
}
