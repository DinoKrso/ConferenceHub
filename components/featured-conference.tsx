"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

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
}

export default function FeaturedConference() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [checkingRegistration, setCheckingRegistration] = useState(false)
  const [featured, setFeatured] = useState<Conference | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { session, isGuest } = useAuth()

  // Fetch the first conference as featured
  useEffect(() => {
    const fetchFeaturedConference = async () => {
      try {
        setError(null)
        const response = await fetch("/api/conferences")
        const data = await response.json()

        if (data.success && data.data.length > 0) {
          setFeatured(data.data[0]) // Use the first conference as featured
        } else {
          setError("No conferences available")
        }
      } catch (error) {
        console.error("Error fetching featured conference:", error)
        setError("Failed to load featured conference")
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedConference()
  }, [])

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!session || !isGuest || !featured?._id) return

      try {
        setCheckingRegistration(true)
        const response = await fetch(`/api/enrollment/check/${featured._id}`)
        const data = await response.json()

        if (data.success) {
          setIsRegistered(data.isRegistered)
        }
      } catch (error) {
        console.error("Error checking registration status:", error)
      } finally {
        setCheckingRegistration(false)
      }
    }

    checkRegistrationStatus()
  }, [session, isGuest, featured?._id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <Card className="overflow-hidden backdrop-blur-sm bg-background/70">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Loading featured conference...</p>
          </div>
        </div>
      </Card>
    )
  }

  if (error || !featured) {
    return (
      <Card className="overflow-hidden backdrop-blur-sm bg-background/70">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{error || "No featured conference available"}</p>
            <Button asChild>
              <Link href="/conferences">Browse All Conferences</Link>
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden backdrop-blur-sm bg-background/70">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="aspect-video w-full bg-muted md:aspect-auto md:h-full">
          <img
            src={featured.image || `/placeholder.svg?height=400&width=600&text=Conference`}
            alt={featured.title}
            className="h-full w-full object-cover"
          />
        </div>
        <CardContent className="flex flex-col justify-between p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-sm">
                  Featured
                </Badge>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {featured.category.name}
                  </Badge>
                  {isRegistered && (
                    <Badge variant="default" className="bg-green-600 text-sm">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Registered
                    </Badge>
                  )}
                </div>
              </div>
              <h3 className="text-2xl font-bold">{featured.title}</h3>
              <p className="text-muted-foreground">{featured.description}</p>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span>
                  {formatDate(featured.startDate)} - {formatDate(featured.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-500" />
                <span>{featured.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span>
                  {featured.attendees} / {featured.maxAttendees} attendees
                </span>
              </div>
            </div>

            {featured.hashTags && featured.hashTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {featured.hashTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {isRegistered ? (
              <Button variant="secondary" className="flex-1" disabled>
                <CheckCircle className="mr-1 h-4 w-4" />
                Already Registered
              </Button>
            ) : (
              <Button asChild className="flex-1" disabled={checkingRegistration}>
                <Link href={`/conferences/${featured._id}`}>
                  {checkingRegistration ? "Checking..." : "Register Now"}
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/conferences/${featured._id}`}>View Details</Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
