"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Filter, MapPin, Users, X, DollarSign, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
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
  }>
}

interface ConferenceListProps {
  limit?: number
  initialSearchTerm?: string
}

export default function ConferenceList({ limit, initialSearchTerm = "" }: ConferenceListProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([])
  const [conferences, setConferences] = useState<Conference[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [registeredConferences, setRegisteredConferences] = useState<Set<string>>(new Set())
  const { session, isGuest, isUser } = useAuth()
  const router = useRouter()
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationConference, setConfirmationConference] = useState<Conference | null>(null)

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/conferences")
        const data = await response.json()

        if (data.success) {
          setConferences(data.data)
        }
      } catch (error) {
        console.error("Error fetching conferences:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchConferences()
  }, [])

  // Check registration status for all conferences
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!session || !isGuest) return

      try {
        const registrationPromises = conferences.map(async (conference) => {
          const response = await fetch(`/api/enrollment/check/${conference._id}`)
          const data = await response.json()
          return { conferenceId: conference._id, isRegistered: data.success && data.isRegistered }
        })

        const results = await Promise.all(registrationPromises)
        const registeredSet = new Set<string>()

        results.forEach(({ conferenceId, isRegistered }) => {
          if (isRegistered) {
            registeredSet.add(conferenceId)
          }
        })

        setRegisteredConferences(registeredSet)
      } catch (error) {
        console.error("Error checking registration status:", error)
      }
    }

    if (conferences.length > 0) {
      checkRegistrationStatus()
    }
  }, [session, isGuest, conferences])

  // Update searchTerm when initialSearchTerm changes
  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm)
    }
  }, [initialSearchTerm])

  // Get all unique hashtags from conferences
  const allHashtags = Array.from(new Set(conferences.flatMap((conference) => conference.hashTags || []))).sort()

  const filteredConferences = conferences
    .filter((conference) => {
      const matchesSearch =
        conference.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conference.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conference.hashTags && conference.hashTags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())))

      const matchesTab = activeTab === "all" || conference.category.name.toLowerCase() === activeTab.toLowerCase()

      const matchesHashtags =
        selectedHashtags.length === 0 ||
        (conference.hashTags && selectedHashtags.every((tag) => conference.hashTags.includes(tag)))

      return matchesSearch && matchesTab && matchesHashtags
    })
    .slice(0, limit || conferences.length)

  const toggleHashtag = (hashtag: string) => {
    setSelectedHashtags((prev) => (prev.includes(hashtag) ? prev.filter((h) => h !== hashtag) : [...prev, hashtag]))
  }

  const handleRegister = async (conference: Conference) => {
    if (!session) {
      router.push("/login")
      return
    }

    if (!isGuest) {
      alert("Only attendees can register for conferences")
      return
    }

    // If the conference is free, show confirmation modal
    if (conference.ticketPrice === 0) {
      setConfirmationConference(conference)
      setShowConfirmationModal(true)
    } else {
      // Show payment modal for paid conferences
      setSelectedConference(conference)
      setShowPaymentModal(true)
    }
  }

  const handleFreeRegistration = async () => {
    if (!confirmationConference) return

    try {
      setEnrolling(confirmationConference._id)

      const response = await fetch("/api/enrollment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conferenceID: confirmationConference._id }),
      })

      const data = await response.json()

      if (data.success) {
        // Update the local state to reflect the enrollment
        setConferences((prevConferences) =>
          prevConferences.map((conf) =>
            conf._id === confirmationConference._id ? { ...conf, attendees: conf.attendees + 1 } : conf,
          ),
        )

        // Add to registered conferences
        setRegisteredConferences((prev) => new Set([...prev, confirmationConference._id]))

        alert("Successfully registered for the conference!")
        setShowConfirmationModal(false)
        setConfirmationConference(null)
      } else {
        alert(data.message || "Failed to register for the conference")
      }
    } catch (error) {
      console.error("Error registering for conference:", error)
      alert("An error occurred while registering for the conference")
    } finally {
      setEnrolling(null)
    }
  }

  const handlePaymentSuccess = () => {
    if (selectedConference) {
      // Update the local state to reflect the enrollment
      setConferences((prevConferences) =>
        prevConferences.map((conf) =>
          conf._id === selectedConference._id ? { ...conf, attendees: conf.attendees + 1 } : conf,
        ),
      )

      // Add to registered conferences
      setRegisteredConferences((prev) => new Set([...prev, selectedConference._id]))
    }
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
    return <div className="flex h-40 items-center justify-center">Loading conferences...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Input
            placeholder="Search conferences..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="IT">IT</TabsTrigger>
          <TabsTrigger value="Security">Security</TabsTrigger>
          <TabsTrigger value="Programming">Programming</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Popular Hashtags</h3>
          {selectedHashtags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground"
              onClick={() => setSelectedHashtags([])}
            >
              Clear all
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {allHashtags.slice(0, 10).map((hashtag) => (
            <Badge
              key={hashtag}
              variant={selectedHashtags.includes(hashtag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleHashtag(hashtag)}
            >
              #{hashtag}
              {selectedHashtags.includes(hashtag) && <X className="ml-1 h-3 w-3" />}
            </Badge>
          ))}
        </div>
      </div>

      {filteredConferences.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="mb-2 text-xl font-semibold">No conferences found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredConferences.map((conference) => {
            const isRegistered = registeredConferences.has(conference._id)

            return (
              <Card key={conference._id} className="overflow-hidden backdrop-blur-sm bg-background/70">
                <div className="aspect-video w-full bg-muted">
                  <img
                    src={conference.image || `/placeholder.svg?height=200&width=400`}
                    alt={conference.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-2 text-xl">{conference.title}</CardTitle>
                    <div className="ml-2 flex flex-col gap-1">
                      <Badge variant="outline" className="shrink-0">
                        {conference.category.name}
                      </Badge>
                      {isRegistered && (
                        <Badge variant="default" className="bg-green-600 shrink-0">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Registered
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-2 p-4 pt-0 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(conference.startDate)} - {formatDate(conference.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{conference.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{conference.attendees} attendees</span>
                  </div>

                  {/* Make price more prominent */}
                  <div className="flex items-center justify-between mt-2 p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-primary">
                        {formatPrice(conference.ticketPrice || 0, conference.currency || "USD")}
                      </span>
                    </div>
                    {conference.ticketPrice === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Free
                      </Badge>
                    )}
                  </div>

                  <p className="line-clamp-2 mt-2">{conference.description}</p>

                  {conference.hashTags && conference.hashTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {conference.hashTags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {conference.hashTags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{conference.hashTags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  {conference.speakersID && conference.speakersID.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs font-medium">Speakers: </span>
                      {conference.speakersID.map((speaker, index) => (
                        <span key={speaker._id} className="text-xs">
                          {speaker.name} {speaker.surname}
                          {index < conference.speakersID!.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex items-center justify-between p-4 pt-0">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/conferences/${conference._id}`}>View Details</Link>
                  </Button>

                  {isRegistered ? (
                    <Button size="sm" variant="secondary" disabled>
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Registered
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleRegister(conference)}
                      disabled={enrolling === conference._id}
                    >
                      {enrolling === conference._id ? "Registering..." : "Register"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Registration Confirmation Modal for Free Events */}
      {confirmationConference && confirmationConference.ticketPrice === 0 && (
        <RegistrationConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => {
            setShowConfirmationModal(false)
            setConfirmationConference(null)
          }}
          conference={confirmationConference}
          onConfirm={handleFreeRegistration}
          loading={enrolling === confirmationConference._id}
        />
      )}

      {/* Payment Modal */}
      {selectedConference && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedConference(null)
          }}
          conference={selectedConference}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
